import _ from 'lodash'
import profiler from "screeps-profiler"
import { progressiveMiner, progressiveLiteWorker } from './body/work'
import { progressiveFighter } from './body/body'
import { HARVESTER, UPGRADER, MINER, RETIRED, FIGHTER, EXTRACTOR, STATIC_UPGRADER, FACTORY_MANAGER, LAB_MANAGER, HAULER, BOOSTER } from '../constants/role'
import domination from './domination'
import { uniqName } from './name'
import { infoStyle } from '../room/style'
import isRetired from 'utils/retired';
import extract, { needsExtractor } from './extract';
import spawnUpgrader from './upgrader';
import { MinerMemory, Miner } from 'role/creep/miner';
import { findContainers } from 'utils/find';

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
    const { creep, memory, name, cooldown, boost } = spawn.memory.trySpawn
    console.log(`[${spawn.room.name}] Retrying spawn a creep`)
    const result = spawn.trySpawnCreep(creep, uniqName(name), memory, true, cooldown, boost)
    if (result === 0) return
    if (cooldown <= 0) {
      delete spawn.memory.spawnSourceId
      delete spawn.memory.trySpawn
    } else spawn.memory.trySpawn.cooldown--
    return
  }
  const harvesterCount = (creepCountByRole[HARVESTER] || 0) + (creepCountByRole[FACTORY_MANAGER] || 0) + (creepCountByRole[LAB_MANAGER] || 0) + (mem._haul === spawn.room.name && creepCountByRole[HAULER] || 0)
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const minerCount = creepCountByRole[MINER] || 0
  const maxUpgradersCount = 3
  const containers = findContainers(spawn.room).length || spawn.room.storage
  const isLinked = spawn.room.linked
  if (minerCount === 0 && !creepCountByRole[RETIRED]) {
    const name = uniqName("M")
    const colonySource = mem.colonySourceId
    spawn.memory.spawnSourceId = colonySource
    spawn.trySpawnCreep(progressiveMiner(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { role: MINER, room: spawn.room.name, _harvest: colonySource, deprivity: 0 } as MinerMemory)
    console.log(`[${spawn.room.name}] Trying spawn a creep @ref`)
  } else if (harvesterCount === 0 && containers) {
    const name = uniqName("J")
    const energyDeclared = creepCountByRole[RETIRED] ? spawn.room.energyCapacityAvailable : spawn.room.energyAvailable
    spawn.trySpawnCreep(progressiveLiteWorker(Math.max(SPAWN_ENERGY_START, energyDeclared)), name, { role: HARVESTER, room: spawn.room.name, deprivity: 0 })
  } else if (needsFighters) {
    const name = uniqName("F")
    spawn.trySpawnCreep(progressiveFighter(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { role: FIGHTER, room: spawn.room.name, deprivity: 0 })
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
    spawn.trySpawnCreep(parts, name, memory)
  } else if ((!isLinked && containers && upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) || (isLinked && !creepCountByRole[STATIC_UPGRADER])) {
    spawnUpgrader(spawn, mem as StableRoomMemory, controller)
  } else if (mem._haul && mem._haul !== spawn.room.name && !creepCountByRole[HAULER]) {
    mem._haulSize = mem._haulSize ? mem._haulSize + 1 : 10
    if (mem._haulSize > 50) mem._haulSize = 50
    spawn.trySpawnCreep(_.times(mem._haulSize, i => i & 1 ? CARRY : MOVE), uniqName("H"), { role: HAULER, room: spawn.room.name, deprivity: 10 })
  } else if (domination(spawn, creepCountByRole)) spawn.room.visual.text("                            in domination", 0, 3, infoStyle)
  else if (needsExtractor(spawn, creepCountByRole[EXTRACTOR])) extract(spawn)
  else spawn.room.visual.text("Spawn is idle.", 0, 3, infoStyle)
}, 'spawnLoop')
