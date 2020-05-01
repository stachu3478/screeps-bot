import { progressiveWorker } from './body'
import { HARVESTER, UPGRADER } from '../constants/role'
import domination from './domination'

function uniqName() {
  let time = 0
  while (Game.creeps['John' + time]) time++
  return 'John' + time
}

export default function loop(spawn: StructureSpawn, creepCountByRole: number[], workPartCountByRole: number[]) {
  let mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  const max = mem.colonySources ? mem.colonySources[mem.colonySourceId || ''].length : 0
  if (spawn.spawning) return
  const harvesterCount = creepCountByRole[HARVESTER] || 0
  const upgraderCount = creepCountByRole[UPGRADER] || 0
  const maxUpgradersCount = ((mem.colonySources && mem.colonySources[mem.controllerSourceId || 0] && mem.colonySources[mem.controllerSourceId || 0].length) || 0) * 3
  if (harvesterCount === 0) {
    spawn.spawnCreep(progressiveWorker(spawn.room.energyAvailable, workPartCountByRole[HARVESTER]), 'John', { memory: { role: HARVESTER, room: spawn.room.name } })
    mem.creeps['John'] = 0
  } else if (harvesterCount < max && workPartCountByRole[HARVESTER] < (mem.maxWorkSpawn || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, (mem.maxWorkSpawn || 0) - workPartCountByRole[HARVESTER])
    const name = uniqName()
    spawn.spawnCreep(parts, name, { memory: { role: HARVESTER, room: spawn.room.name } })
    mem.creeps[name] = 0
  } else if (upgraderCount < maxUpgradersCount && (workPartCountByRole[UPGRADER] || 0) < (mem.maxWorkController || 0)) {
    const parts = progressiveWorker(spawn.room.energyCapacityAvailable, (mem.maxWorkController || 0) - workPartCountByRole[UPGRADER])
    const name = uniqName()
    spawn.spawnCreep(parts, uniqName(), { memory: { role: UPGRADER, room: spawn.room.name } })
    mem.creeps[name] = 0
  } else domination(spawn, creepCountByRole)
}
