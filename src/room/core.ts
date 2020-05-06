import roleHarvester from '../role/harvester'
import roleUpgrader from '../role/upgrader'
import roleClaimer from '../role/claimer'
import roleScout from '../role/scout'
import roleFortifier from '../role/fortifier'
import commander from '../role/commander'
import tower from '../role/tower'
import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER, MINER } from '../constants/role'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy from './enemyTrack';
import visual from 'planner/visual'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import miner from 'role/miner';
import isRetired from 'utils/retired';

export default function run(room: Room, cpuUsed: number) {
  if (!room.memory.roads) plan(room)
  visual(room)

  const creepCountByRole: number[] = []
  const workPartCountByRole: number[] = []
  let mem = room.memory
  if (!mem.creeps) mem.creeps = {}
  let count = 0

  const enemy = trackEnemy(room)
  let deprived
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
    }
    if (creep.spawning) continue
    if (enemy) switch (creep.memory.role) {
      case HARVESTER: case UPGRADER: roleFortifier(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      case MINER: miner(creep); break
      default: creep.memory.role = UPGRADER;
    } else switch (creep.memory.role) {
      case HARVESTER: roleHarvester(creep); break
      case UPGRADER: roleUpgrader(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      case MINER: miner(creep); break
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
    }
  })

  if (enemy) {
    room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, enemy) })
    room.visual.text("Enemy tracked: " + enemy.name, 0, 4, dangerStyle)
  }

  let spawn = Game.spawns[room.memory.spawnName || '']
  if (!spawn) {
    spawn = room.find(FIND_MY_SPAWNS)[0]
    if (!spawn) {
      if (count === 0) callRescue(room)
    } else room.memory.spawnName = spawn.name
  }

  if (spawn) spawnLoop(spawn, creepCountByRole, workPartCountByRole)
  room.visual.text("Population: " + count, 0, 0, count === 0 ? dangerStyle : infoStyle)
  room.visual.text("Spawns: " + room.energyAvailable + "/" + room.energyCapacityAvailable, 0, 1, room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle)
  return usage(room, cpuUsed)
}
