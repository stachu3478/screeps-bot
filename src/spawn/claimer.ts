import { progressiveClaimer } from './body/body'
import { needsClaim } from './scout'

export function needsClaimer(spawn: StructureSpawn, count: number) {
  return spawn.room.memory[RoomMemoryKeys.claim] && needsClaim(spawn) && !count
}

export function spawnClaimer(spawn: StructureSpawn) {
  let body = [MOVE, CLAIM]
  if (!Memory.slimClaimers)
    body = progressiveClaimer(spawn.room.energyCapacityAvailable)
  spawn.trySpawnCreep(
    body,
    'C',
    { role: Role.CLAIMER, room: spawn.room.name, deprivity: 0 },
    false,
    20,
  )
}
