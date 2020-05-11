import _ from 'lodash'
import roleHarvester from '../role/harvester'
import roleUpgrader from '../role/upgrader'
import roleClaimer from '../role/claimer'
import roleScout from '../role/scout'
import commander from '../role/commander'
import tower from '../role/tower'
import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER, MINER, RETIRED, EXTRACTOR, FIGHTER, STATIC_UPGRADER } from '../constants/role'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy, { findMostVulnerableCreep } from './enemyTrack';
import visual from 'planner/visual'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import miner from 'role/miner';
import isRetired from 'utils/retired';
import extractor from 'role/extractor';
import fighter from 'role/fighter';
import staticUpgrader from '../role/staticUpgrader';
import handleLog from './log';
import { roomPos } from 'planner/pos';

export default function run(room: ControlledRoom, cpuUsed: number) {
  if (!room.memory.roads) plan(room)
  visual(room)

  const creepCountByRole: number[] = []
  const workPartCountByRole: number[] = []
  let mem = room.memory
  if (!mem.creeps) mem.creeps = {}
  let count = 0

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
  for (const name in mem.creeps) {
    const creep = Game.creeps[name]
    if (!creep) {
      delete mem.creeps[name]
      delete Memory.creeps[name]
      continue
    }
    if (creep.memory.room !== room.name) {
      if (creep.room.name !== room.name) {
        delete mem.creeps[name]
      } else {
        const otherMemRoom = Memory.rooms[creep.memory.room].creeps
        if (otherMemRoom) delete otherMemRoom[creep.name]
        creep.memory.room = room.name
      }
    }
    const role = creep.memory.role || 0
    if (!isRetired(creep)) {
      creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
      workPartCountByRole[role] = (workPartCountByRole[role] || 0) + creep.getActiveBodyparts(WORK)
      count++
    } else creepCountByRole[RETIRED] = (creepCountByRole[RETIRED] || 0) + 1
    if (creep.spawning) continue
    switch (creep.memory.role) {
      case HARVESTER: roleHarvester(creep); break
      case UPGRADER: roleUpgrader(creep); break
      case STATIC_UPGRADER: staticUpgrader(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      case MINER: miner(creep); break
      case EXTRACTOR: extractor(creep); break
      case FIGHTER: fighter(creep); break
      default: creep.memory.role = UPGRADER;
    }
  }

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
