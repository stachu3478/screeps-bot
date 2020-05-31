import _ from 'lodash'
import { progressiveMiner, progressiveLiteWorker } from './body/work'
import { progressiveFighter } from './body/body'
import { HARVESTER, UPGRADER, MINER, RETIRED, FIGHTER, EXTRACTOR, STATIC_UPGRADER, FACTORY_MANAGER, LAB_MANAGER, HAULER, BOOSTER } from '../constants/role'
import domination from './domination'
import { uniqName } from './name'
import { infoStyle } from '../room/style'
import isRetired from 'utils/retired';
import extract from './extract';
import spawnUpgrader from './upgrader';
import { MinerMemory, Miner } from 'role/creep/miner';
import { findContainers } from 'utils/find';
import profiler from "screeps-profiler"

export function trySpawnCreep(body: BodyPartConstant[], name: string, memory: CreepMemory, spawn: StructureSpawn, retry: boolean = false, cooldown: number = 100) {
  const result = spawn.spawnCreep(body, name, { memory, directions: spawn.getDirections() })
  const mem = spawn.room.memory as StableRoomMemory
  if (result !== 0) {
    if (!retry) spawn.memory.trySpawn = {
      creep: body,
      name,
      memory,
      cooldown
    }
  } else {
    mem.priorityFilled = 0
    mem.creeps[name] = 0
    if (memory.role === BOOSTER && spawn.room.terminal) {
      spawn.room.reserveBoost(name, RESOURCE_UTRIUM_OXIDE, LAB_BOOST_MINERAL * Math.floor(Math.min(body.reduce((n, part) => n + (part === WORK ? 1 : 0), 0), spawn.room.terminal.store[RESOURCE_UTRIUM_OXIDE])) / LAB_BOOST_MINERAL)
    }
    if (memory.role === MINER) mem.colonySources[spawn.memory.spawnSourceId || ''] = mem.colonySources[spawn.memory.spawnSourceId || ''].slice(0, 2) + name
    delete spawn.memory.spawnSourceId
    delete spawn.memory.trySpawn
  }
  spawn.room.visual.text("Try to spawn " + name, 0, 3, infoStyle)
  return result
}

export default profiler.registerFN(function loop(spawn: StructureSpawn, controller: StructureController, creepCountByRole: number[], workPartCountByRole: number[], needsFighters: boolean) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (!mem.colonySources || mem.maxWorkController === undefined || !mem.colonySourceId) return
  const max = mem.sourceCount || 0
  if (spawn.spawning) {
    spawn.room.visual.text("Spawning " + spawn.spawning.name, 0, 3, infoStyle)
    return
  }
  if (spawn.room.energyAvailable < spawn.room.energyCapacityAvailable) mem.priorityFilled = 0
  if (spawn.memory.trySpawn) {
    const { creep, memory, name, cooldown } = spawn.memory.trySpawn
    const result = trySpawnCreep(creep, uniqName(name), memory, spawn, true)
    if (result === 0) return
    if (cooldown <= 0) {
      delete spawn.memory.spawnSourceId
      delete spawn.memory.trySpawn
    } else spawn.memory.trySpawn.cooldown--
    return
  }
  const harvesterCount = (creepCountByRole[HARVESTER] || 0) + (creepCountByRole[FACTORY_MANAGER] || 0) + (creepCountByRole[LAB_MANAGER] || 0)
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const minerCount = creepCountByRole[MINER] || 0
  const maxUpgradersCount = 3
  const containers = findContainers(spawn.room).length || spawn.room.storage
  if (minerCount === 0 && !creepCountByRole[RETIRED]) {
    const name = uniqName("M")
    const colonySource = mem.colonySourceId
    spawn.memory.spawnSourceId = colonySource
    trySpawnCreep(progressiveMiner(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { role: MINER, room: spawn.room.name, _harvest: colonySource, deprivity: 0 } as MinerMemory, spawn)
  } else if (harvesterCount === 0 && containers) {
    const name = uniqName("J")
    const energyDeclared = creepCountByRole[RETIRED] ? spawn.room.energyCapacityAvailable : spawn.room.energyAvailable
    trySpawnCreep(progressiveLiteWorker(Math.max(SPAWN_ENERGY_START, energyDeclared)), name, { role: HARVESTER, room: spawn.room.name, deprivity: 0 }, spawn)
  } else if (needsFighters) {
    const name = uniqName("F")
    trySpawnCreep(progressiveFighter(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { role: FIGHTER, room: spawn.room.name, deprivity: 0 }, spawn)
  } else if (minerCount < max) {
    const parts = progressiveMiner(spawn.room.energyCapacityAvailable)
    const name = uniqName("M")
    let freeSource
    for (const id in mem.colonySources) {
      const name = mem.colonySources[id].slice(2)
      const creep = Game.creeps[name] as Miner
      if (!creep || creep.memory._harvest !== id || isRetired(creep)) {
        freeSource = id
        break
      }
    }
    if (!freeSource) return
    spawn.memory.spawnSourceId = freeSource as Id<Source>
    mem.colonySources[freeSource] = mem.colonySources[freeSource].slice(0, 2) + name
    const spec = mem.colonySources[freeSource].charCodeAt(1)
    const memory: MinerMemory = { role: MINER, room: spawn.room.name, _harvest: freeSource as Id<Source>, deprivity: spec }
    trySpawnCreep(parts, name, memory, spawn)
  } else if ((!mem._linked && containers && upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) || (mem._linked && !creepCountByRole[STATIC_UPGRADER])) {
    spawnUpgrader(spawn, mem as StableRoomMemory, controller)
  } else if (mem._haul && !creepCountByRole[HAULER]) {
    mem._haulSize = mem._haulSize ? mem._haulSize + 1 : 10
    if (mem._haulSize > 50) mem._haulSize = 50
    trySpawnCreep(_.times(mem._haulSize, i => i & 1 ? CARRY : MOVE), uniqName("H"), { role: HAULER, room: spawn.room.name, deprivity: 10 }, spawn)
  } else if (domination(spawn, creepCountByRole)) spawn.room.visual.text("                            in domination", 0, 3, infoStyle)
  else if (!creepCountByRole[EXTRACTOR]) extract(spawn)
  else spawn.room.visual.text("Spawn is idle.", 0, 3, infoStyle)
}, 'spawnLoop')
