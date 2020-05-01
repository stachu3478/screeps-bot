import { progressiveWorker } from './body'
import { HARVESTER, UPGRADER } from '../constants/role'
import domination from './domination'
import { uniqName } from './name'
import { infoStyle } from '../room/style'

export default function loop(spawn: StructureSpawn, creepCountByRole: number[], workPartCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  const max = mem.colonySources ? mem.colonySources[mem.colonySourceId || ''].length : 0
  if (spawn.spawning) {
    spawn.room.visual.text("Spawning " + spawn.spawning.name, 0, 3, infoStyle)
    return
  }
  const harvesterCount = creepCountByRole[HARVESTER] || 0
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const maxUpgradersCount = ((mem.colonySources && mem.colonySources[mem.controllerSourceId || 0] && mem.colonySources[mem.controllerSourceId || 0].length) || 0) * 3
  if (harvesterCount === 0) {
    const name = uniqName("J")
    spawn.spawnCreep(progressiveWorker(spawn.room.energyAvailable, workPartCountByRole[HARVESTER]), name, { memory: { role: HARVESTER, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn first harvester.", 0, 3, infoStyle)
  } else if (harvesterCount < max && workPartCountByRole[HARVESTER] < (mem.maxWorkSpawn || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, (mem.maxWorkSpawn || 0) - workPartCountByRole[HARVESTER])
    const name = uniqName("J")
    spawn.spawnCreep(parts, name, { memory: { role: HARVESTER, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn harvester.", 0, 3, infoStyle)
  } else if (upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, (mem.maxWorkController || 0) - workPartCountByRole[UPGRADER])
    const name = uniqName("U")
    spawn.spawnCreep(parts, name, { memory: { role: UPGRADER, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn upgrader.", 0, 3, infoStyle)
  } else domination(spawn, creepCountByRole)
}
