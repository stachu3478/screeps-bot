import { progressiveWorker } from './body/work'

export function needsExtractor(spawn: StructureSpawn, extractorCount?: number) {
  if (extractorCount) return false
  const room = spawn.room
  const mem = room.memory
  if (!mem.creeps) return false
  if (!room.buildings.extractor || !room.mineral!.mineralAmount) return false
  return true
}

export default function extract(spawn: StructureSpawn) {
  let memory = { role: Role.EXTRACTOR }
  const body = progressiveWorker(spawn.room.energyCapacityAvailable)
  const boostRequests = spawn.room.boosts.prepareData(
    memory,
    [CARRY, WORK],
    ['capacity', 'harvest'],
    body,
  )
  spawn.trySpawnCreep(body, 'D', memory, false, 25, boostRequests)
  return true
}
