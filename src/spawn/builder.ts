import { progressiveWorker } from './body/work'

export function needsBuilder(spawn: StructureSpawn, buildersCount?: number) {
  if (buildersCount) return false
  const room = spawn.room
  const mem = room.memory
  if (!mem.creeps) return false
  const mineral = room.mineral
  if (!mineral || !mineral.mineralAmount || !room.extractor) return false
  return true
}

export default function spawnBuilder(spawn: StructureSpawn) {
  let memory = {
    role: Role.BUILDER,
    room: spawn.room.name,
    deprivity: 0,
  }
  const body = progressiveWorker(spawn.room.energyCapacityAvailable)
  const boostRequests = spawn.room.prepareBoostData(
    memory,
    [CARRY, WORK],
    ['capacity', 'build'],
    body,
  )
  spawn.trySpawnCreep(body, 'B', memory, false, 25, boostRequests)
  return true
}
