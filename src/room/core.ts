import _ from 'lodash'
import tower from '../role/tower'
import { RETIRED, FIGHTER } from '../constants/role'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy, { findMostVulnerableCreep } from './enemyTrack';
import visual from 'planner/visual'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import handleLog from './log';
import { roomPos } from 'planner/pos';
import creeps from './creeps';

export default function run(room: ControlledRoom, cpuUsed: number) {
  if (!room.memory.roads) plan(room)
  visual(room)

  let mem = room.memory
  if (!mem.creeps) mem.creeps = {}

  const enemies = trackEnemy(room)
  let enemy: Creep | undefined
  let needFighters = false
  let towersProcessed = false
  if (enemies.length) {
    const towers = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }) as StructureTower[]
    const fighters = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === FIGHTER })
    const found = findMostVulnerableCreep(enemies, towers, fighters)
    enemy = found.enemy
    if (found.vulnerability <= 0) needFighters = true
    else {
      towers.forEach((t) => tower(t, found.enemy))
      towersProcessed = true
    }
    room.visual.text("Enemy tracked: " + enemy.name + " Vulnerability: " + found.vulnerability, 0, 4, dangerStyle)
    mem._healthy = false
  } else {
    const powerEnemy = room.find(FIND_HOSTILE_POWER_CREEPS)[0]
    if (powerEnemy) {
      room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, powerEnemy) })
      towersProcessed = true
    }
  }
  if (!mem._healthy && !towersProcessed) {
    const creeps = room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax })
    if (creeps) room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, creeps[_.random(0, creeps.length - 1)]) })
    else mem._healthy = true
  }

  const {
    creepCountByRole,
    workPartCountByRole,
    count,
  } = creeps(mem.creeps, room, enemy, needFighters)

  handleLog(room, room.getEventLog())

  let spawn = Game.spawns[room.memory.spawnName || '']
  if (!spawn) {
    spawn = room.find(FIND_MY_SPAWNS)[0]
    if (!spawn) {
      if (count === 0 && !creepCountByRole[RETIRED]) callRescue(room)
      const sites = room.find(FIND_CONSTRUCTION_SITES)
      const spawnSite = sites.filter(s => s.structureType === STRUCTURE_SPAWN)[0]
      if (!spawnSite) {
        sites.forEach(s => s.remove())
        if (room.memory.structs) roomPos(room.memory.structs[1], room.name).createConstructionSite(STRUCTURE_SPAWN)
      }
    } else room.memory.spawnName = spawn.name
  }

  if (spawn) spawnLoop(spawn, creepCountByRole, workPartCountByRole, needFighters)
  room.visual.text("Population: " + count + " Retired: " + (creepCountByRole[RETIRED] || 0), 0, 0, count === 0 ? dangerStyle : infoStyle)
  room.visual.text("Spawns: " + room.energyAvailable + "/" + room.energyCapacityAvailable, 0, 1, room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle)
  return usage(room, cpuUsed)
}
