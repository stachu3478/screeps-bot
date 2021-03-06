import { progressiveCommander } from './body/body'

export default function domination(
  spawn: StructureSpawn,
  creepCountByRole: number[],
) {
  const mem = spawn.room.memory
  if (!mem._attack) return
  const memory = { role: Role.COMMANDER }
  const body = progressiveCommander(
    spawn.room.energyCapacityAvailable,
    mem._attackLevel || 3,
  )
  const boostRequests = spawn.room.boosts.prepareData(
    memory,
    [HEAL, TOUGH],
    ['heal', 'damage'],
    body,
  )
  spawn.trySpawnCreep(body, 'S', memory, false, 10, boostRequests)
  return true
}
