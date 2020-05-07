import roleHarvester from '../role/harvester'
import roleUpgrader from '../role/upgrader'
import roleClaimer from '../role/claimer'
import roleScout from '../role/scout'
import roleFortifier from '../role/fortifier'
import commander from '../role/commander'
import tower from '../role/tower'
import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER, MINER, RETIRED, EXTRACTOR, FIGHTER } from '../constants/role'
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
  if (enemies.length) {
    const towers = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER }) as StructureTower[]
    const fighters = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === FIGHTER })
    const found = findMostVulnerableCreep(enemies, towers, fighters)
    enemy = found.enemy
    if (found.vulnerability <= 0) needFighters = true
    towers.forEach((t) => tower(t, found.enemy))
    room.visual.text("Enemy tracked: " + enemy.name, 0, 4, dangerStyle)
    mem._healthy = false
  }
  if (!mem._healthy) {
    const creep = room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax })[0]
    if (creep) room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, creep) })
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
    if (enemies.length) switch (creep.memory.role) {
      case HARVESTER: case UPGRADER: roleFortifier(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      case MINER: miner(creep); break
      case EXTRACTOR: extractor(creep); break
      case FIGHTER: fighter(creep, enemy); break
      default: creep.memory.role = UPGRADER;
    } else switch (creep.memory.role) {
      case HARVESTER: roleHarvester(creep); break
      case UPGRADER: roleUpgrader(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      case MINER: miner(creep); break
      case EXTRACTOR: extractor(creep); break
      case FIGHTER: fighter(creep); break
      default: creep.memory.role = UPGRADER;
    }
  }

  const logs = room.getEventLog()
  logs.forEach(l => {
    switch (l.event) {
      case EVENT_ATTACK:
        if (l.data.attackType === EVENT_ATTACK_TYPE_HIT_BACK) return;
      case EVENT_ATTACK_CONTROLLER:
        const creep = Game.getObjectById(l.objectId as Id<Creep>)
        if (!Memory.whitelist) Memory.whitelist = {}
        if (creep && creep.owner && Memory.whitelist[creep.owner.username]) {
          const message = `${creep.owner.username} has been removed from the whitelist due to violating peace regulations`
          console.log(message)
          Game.notify(message, 5)
          delete Memory.whitelist[creep.owner.username]
        }
        break
      case EVENT_OBJECT_DESTROYED:
        const type = l.data.type
        if (type !== LOOK_CREEPS) {
          if (type === STRUCTURE_ROAD) mem._roadBuilt = false
          else mem._built = false
        }
        break
      case EVENT_UPGRADE_CONTROLLER:
        const controllerLevel = room.controller.level
        if (controllerLevel !== mem._lvl) {
          mem._built = false
          mem._lvl = controllerLevel
          mem._struct_iteration = 0
        }
    }
  })

  let spawn = Game.spawns[room.memory.spawnName || '']
  if (!spawn) {
    spawn = room.find(FIND_MY_SPAWNS)[0]
    if (!spawn) {
      if (count === 0) callRescue(room)
    } else room.memory.spawnName = spawn.name
  }

  if (spawn) spawnLoop(spawn, creepCountByRole, workPartCountByRole, needFighters)
  room.visual.text("Population: " + count, 0, 0, count === 0 ? dangerStyle : infoStyle)
  room.visual.text("Spawns: " + room.energyAvailable + "/" + room.energyCapacityAvailable, 0, 1, room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle)
  return usage(room, cpuUsed)
}
