import { progressiveCommander } from './body/body'

export default function domination(
  spawn: StructureSpawn,
  creepCountByRole: number[],
) {
  const mem = spawn.room.memory
  if (!mem._attack) return
  const memory = { role: Role.COMMANDER, room: spawn.room.name, deprivity: 0 }
  const body = progressiveCommander(
    spawn.room.energyCapacityAvailable,
    mem._attackLevel || 3,
  )
  const boostRequests = spawn.room.prepareBoostData(
    memory,
    [HEAL, TOUGH],
    ['heal', 'damage'],
    body,
  )
  spawn.trySpawnCreep(body, 'S', memory, false, 10, boostRequests)
  return true
}
