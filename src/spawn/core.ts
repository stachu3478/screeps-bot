import { progressiveWorker, progressiveMiner } from './body'
import { HARVESTER, UPGRADER, MINER } from '../constants/role'
import domination from './domination'
import { uniqName } from './name'
import { infoStyle } from '../room/style'
import { RECYCLE } from 'constants/state';

export default function loop(spawn: StructureSpawn, creepCountByRole: number[], workPartCountByRole: number[], deprived?: Creep) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (!mem.colonySources) return
  const max = mem.sourceCount || 0
  if (spawn.spawning) {
    spawn.room.visual.text("Spawning " + spawn.spawning.name, 0, 3, infoStyle)
    if (deprived && spawn.memory.upgradeMode && spawn.spawning.remainingTime === 1) { // recycle old creep
      deprived.memory.state = RECYCLE
      spawn.memory.upgradeMode = false
      delete deprived.memory.deprived
    }
    return
  }
  const harvesterCount = creepCountByRole[HARVESTER] || 0
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const minerCount = creepCountByRole[MINER] || 0
  const maxUpgradersCount = 3
  const containers = spawn.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length
  if (minerCount === 0) {
    const name = uniqName("M")
    spawn.spawnCreep(progressiveMiner(Math.max(SPAWN_ENERGY_START, spawn.room.energyCapacityAvailable)), name, { memory: { role: MINER, room: spawn.room.name, _harvest: mem.colonySourceId } })
    mem.creeps[name] = 0
    mem.colonySources[mem.colonySourceId || ''] = mem.colonySources[mem.colonySourceId || ''].slice(0, 2) + name
    spawn.room.visual.text("Try to spawn first miner.", 0, 3, infoStyle)
  } else if (harvesterCount === 0 && containers) {
    const name = uniqName("J")
    spawn.spawnCreep(progressiveWorker(Math.max(SPAWN_ENERGY_START, spawn.room.energyCapacityAvailable)), name, { memory: { role: HARVESTER, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn first ... and last harvester.", 0, 3, infoStyle)
  } else if (minerCount < max) {
    const parts = progressiveMiner(spawn.room.energyCapacityAvailable)
    const name = uniqName("M")
    let freeSource
    for (const id in mem.colonySources) {
      const name = mem.colonySources[id].slice(2)
      const creep = Game.creeps[name]
      if (!creep || creep.memory._harvest !== id || (creep.ticksToLive || 0) <= creep.body.length * CREEP_SPAWN_TIME) {
        freeSource = id
        break
      }
    }
    if (!freeSource) return
    mem.colonySources[freeSource] = mem.colonySources[freeSource].slice(0, 2) + name
    spawn.spawnCreep(parts, name, { memory: { role: MINER, room: spawn.room.name, _harvest: freeSource as Id<Source> } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn miner.", 0, 3, infoStyle)
  } else if (containers && upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, mem.maxWorkController)
    const name = uniqName("U")
    spawn.spawnCreep(parts, name, { memory: { role: UPGRADER, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn upgrader.", 0, 3, infoStyle)
  } else domination(spawn, creepCountByRole)
}
