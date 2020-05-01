import roleHarvester from '../role/harvester'
import roleUpgrader from '../role/upgrader'
import roleClaimer from '../role/claimer'
import roleScout from '../role/scout'
import commander from '../role/commander'
import tower from '../role/tower'
import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER } from '../constants/role'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue';
import trackEnemy from './enemyTrack';
import visual from 'planner/visual'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'

export default function run(room: Room, cpuUsed: number) {
  if (!room.memory.roads) plan(room)
  visual(room)

  const creepCountByRole: number[] = []
  const workPartCountByRole: number[] = []
  let mem = room.memory
  if (!mem.creeps) mem.creeps = {}
  let count = 0
  for (const name in mem.creeps) {
    const creep = Game.creeps[name]
    if (!creep) {
      delete mem.creeps[name]
      delete Memory.creeps[name]
      continue
    }
    const role = creep.memory.role || 0
    creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
    workPartCountByRole[role] = (workPartCountByRole[role] || 0) + creep.getActiveBodyparts(WORK)
    count++
    if (creep.spawning) continue
    switch (creep.memory.role) {
      case HARVESTER: roleHarvester(creep); break
      case UPGRADER: roleUpgrader(creep); break
      case SCOUT: roleScout(creep); break
      case CLAIMER: roleClaimer(creep); break
      case COMMANDER: commander(creep); break
      default: creep.memory.role = UPGRADER;
    }
  }

  const enemy = trackEnemy(room)
  if (enemy) room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && tower(s, enemy) })

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
