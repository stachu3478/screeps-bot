import _ from 'lodash'
import tower from '../role/tower'
import { RETIRED } from '../constants/role'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy, { findMostVulnerableCreep } from './enemyTrack';
import visual from 'planner/visual'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import handleLog from './log';
import creeps from './creeps';
import terminal from 'role/terminal';
import { findTowers, findFighters, findDamagedCreeps } from 'utils/find';
import lab from 'role/lab';
import { getXYLab, getXYFactory } from 'utils/selectFromPos';
import { factory } from 'utils/handleFactory';

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
    mem._healthy = false
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
        if (room.memory.structs) {
          const pos = room.memory.structs.charCodeAt(1)
          room.createConstructionSite(pos & 63, pos >> 6, STRUCTURE_SPAWN)
        }
      }
    } else room.memory.spawnName = spawn.name
  }

  if (room.terminal) terminal(room.terminal)
  if (mem.externalLabs && mem.internalLabs) {
    const labPos1 = mem.internalLabs.charCodeAt(0)
    const labPos2 = mem.internalLabs.charCodeAt(1)
    const lab1 = getXYLab(room, labPos1 & 63, labPos1 >> 6)
    const lab2 = getXYLab(room, labPos2 & 63, labPos2 >> 6)
    if (lab1 && lab2) {
      const otherLabs = mem.externalLabs.split('').map(char => {
        const xy = char.charCodeAt(0)
        return getXYLab(room, xy & 63, xy >> 6)
      }).filter(l => l) as StructureLab[]
      lab(lab1, lab2, otherLabs)
    }
  }

  const factoryPos = (mem.structs || '').charCodeAt(4)
  const factoryStructure = getXYFactory(room, factoryPos & 63, factoryPos >> 6)
  if (factoryStructure) factory(factoryStructure)

  if (spawn) spawnLoop(spawn, creepCountByRole, workPartCountByRole, needFighters)
  room.visual.text("Population: " + count + " Retired: " + (creepCountByRole[RETIRED] || 0), 0, 0, count === 0 ? dangerStyle : infoStyle)
  room.visual.text("Spawns: " + room.energyAvailable + "/" + room.energyCapacityAvailable, 0, 1, room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle)
  return usage(room, cpuUsed)
}
