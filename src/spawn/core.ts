import { progressiveWorker, progressiveMiner, progressiveLiteWorker, progressiveFighter } from './body'
import { HARVESTER, UPGRADER, MINER, RETIRED, FIGHTER, EXTRACTOR } from '../constants/role'
import domination from './domination'
import { uniqName } from './name'
import { infoStyle } from '../room/style'
import isRetired from 'utils/retired';
import extract from './extract';

export default function loop(spawn: StructureSpawn, creepCountByRole: number[], workPartCountByRole: number[], needsFighters: boolean) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (!mem.colonySources || !mem.maxWorkController) return
  const max = mem.sourceCount || 0
  if (spawn.spawning) {
    spawn.room.visual.text("Spawning " + spawn.spawning.name, 0, 3, infoStyle)
    return
  }
  const harvesterCount = creepCountByRole[HARVESTER] || 0
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const minerCount = creepCountByRole[MINER] || 0
  const maxUpgradersCount = 3
  const containers = spawn.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length
  if (minerCount === 0 && !creepCountByRole[RETIRED]) {
    const name = uniqName("M")
    const colonySource = mem.colonySourceId || ''
    const result = spawn.spawnCreep(progressiveMiner(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { memory: { role: MINER, room: spawn.room.name, _harvest: mem.colonySourceId, deprivity: 0 } })
    if (result === 0) {
      mem.creeps[name] = 0
      mem.colonySources[colonySource] = mem.colonySources[mem.colonySourceId || ''].slice(0, 2) + name
    } else spawn.room.visual.text("Try to spawn first miner.", 0, 3, infoStyle)
  } else if (harvesterCount === 0 && containers) {
    const name = uniqName("J")
    const energyDeclared = creepCountByRole[RETIRED] ? spawn.room.energyCapacityAvailable : spawn.room.energyAvailable
    const result = spawn.spawnCreep(progressiveLiteWorker(Math.max(SPAWN_ENERGY_START, energyDeclared)), name, { memory: { role: HARVESTER, room: spawn.room.name, deprivity: 0 } })
    if (result === 0) mem.creeps[name] = 0
    else spawn.room.visual.text("Try to spawn first ... and last harvester.", 0, 3, infoStyle)
  } else if (needsFighters) {
    const name = uniqName("F")
    const result = spawn.spawnCreep(progressiveFighter(Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)), name, { memory: { role: FIGHTER, room: spawn.room.name, deprivity: 0 } })
    if (result === 0) mem.creeps[name] = 0
    else spawn.room.visual.text("Try to spawn fighter.", 0, 3, infoStyle)
  } else if (minerCount < max) {
    const parts = progressiveMiner(spawn.room.energyCapacityAvailable)
    const name = uniqName("M")
    let freeSource
    for (const id in mem.colonySources) {
      const name = mem.colonySources[id].slice(2)
      const creep = Game.creeps[name]
      if (!creep || creep.memory._harvest !== id || isRetired(creep)) {
        freeSource = id
        break
      }
    }
    if (!freeSource) return
    mem.colonySources[freeSource] = mem.colonySources[freeSource].slice(0, 2) + name
    const spec = mem.colonySources[freeSource].charCodeAt(1)
    const result = spawn.spawnCreep(parts, name, { memory: { role: MINER, room: spawn.room.name, _harvest: freeSource as Id<Source>, deprivity: spec } })
    if (result === 0) mem.creeps[name] = 0
    else spawn.room.visual.text("Try to spawn miner.", 0, 3, infoStyle)
  } else if (containers && upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, mem.maxWorkController)
    const name = uniqName("U")
    if (!mem.workControllerOver) mem.workControllerOver = 0
    if (spawn.room.storage) {
      const stored = spawn.room.storage.store[RESOURCE_ENERGY]
      if (stored > (4 + mem.workControllerOver) * CREEP_LIFE_TIME * UPGRADE_CONTROLLER_POWER) {
        mem.maxWorkController++
        mem.workControllerOver++
      } else if (stored < 500) {
        mem.maxWorkController--
        mem.workControllerOver--
      }
    }
    const result = spawn.spawnCreep(parts, name, { memory: { role: UPGRADER, room: spawn.room.name, deprivity: 0 } })
    if (result === 0) mem.creeps[name] = 0
    else spawn.room.visual.text("Try to spawn upgrader.", 0, 3, infoStyle)
  } else if (domination(spawn, creepCountByRole)) spawn.room.visual.text("                            in domination", 0, 3, infoStyle)
  else if (!creepCountByRole[EXTRACTOR]) extract(spawn)
  else spawn.room.visual.text("Spawn is idle.", 0, 3, infoStyle)
}
