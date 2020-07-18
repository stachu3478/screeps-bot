import _ from 'lodash'
import tower from '../role/tower'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy, { findMostVulnerableCreep } from './enemyTrack';
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import handleLog from './log';
import creeps from './creeps';
import terminal from 'role/terminal';
import { findTowers, findFighters, findDamagedCreeps } from 'utils/find';
import lab from 'role/lab';
import factory from 'role/factory';
import rolePowerSpawn from 'role/powerSpawn'

export default function run(controller: StructureController, cpuUsed: number) {
  const room = controller.room
  if (!room.memory.roads) plan(room)

  let mem = room.memory
  if (!mem.creeps) mem.creeps = {}

  const enemies = trackEnemy(room)
  let enemy: Creep | undefined
  let needFighters = false
  let towersProcessed = false
  if (enemies.length) {
    const towers = findTowers(room)
    const fighters = findFighters(room)
    const found = findMostVulnerableCreep(enemies, towers, fighters)
    enemy = found.enemy
    if (found.vulnerability <= 0) needFighters = true
    else {
      towers.forEach((t) => tower(t, found.enemy))
      towersProcessed = true
    }
    room.visual.text("Enemy tracked: " + enemy.name + " Vulnerability: " + found.vulnerability, 0, 4, dangerStyle)
    mem._healthy = 0
  } else {
    const powerEnemy = room.find(FIND_HOSTILE_POWER_CREEPS)[0]
    if (powerEnemy) {
      room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, powerEnemy) })
      towersProcessed = true
    }
  }
  if (!mem._healthy && !towersProcessed) {
    const creeps = findDamagedCreeps(room)
    if (creeps.length) room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, creeps[_.random(0, creeps.length - 1)]) })
    else mem._healthy = 1
  }

  const {
    creepCountByRole,
    workPartCountByRole,
    count,
  } = creeps(mem.creeps, room, enemy, needFighters)

  handleLog(mem, controller)

  const spawns = room.find(FIND_MY_SPAWNS)
  if (!spawns.length) {
    if (count === 0 && !creepCountByRole[Role.RETIRED]) callRescue(room)
    const sites = room.find(FIND_CONSTRUCTION_SITES)
    const spawnSite = sites.filter(s => s.structureType === STRUCTURE_SPAWN)[0]
    if (!spawnSite) {
      sites.forEach(s => s.remove())
      if (room.memory.structs) {
        const pos = room.memory.structs.charCodeAt(1)
        room.createConstructionSite(pos & 63, pos >> 6, STRUCTURE_SPAWN)
      }
    }
  }

  if (room.terminal) terminal(room.terminal)
  lab(room)

  const factoryStructure = room.factory
  if (factoryStructure) factory(factoryStructure)

  const powerSpawn = room.powerSpawn
  if (powerSpawn) rolePowerSpawn(powerSpawn)

  const spawn = spawns.find(s => !s.spawning)
  if (spawn) spawnLoop(spawn, controller, creepCountByRole, workPartCountByRole, needFighters)
  else room.visual.text("All spawns busy", 0, 3, infoStyle)
  room.visual.text("Population: " + count + " Retired: " + (creepCountByRole[Role.RETIRED] || 0), 0, 0, count === 0 ? dangerStyle : infoStyle)
  room.visual.text("Spawns: " + room.energyAvailable + "/" + room.energyCapacityAvailable, 0, 1, room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle)
  return usage(room, cpuUsed)
}
