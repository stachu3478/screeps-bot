import ClaimPlanner from 'planner/military/ClaimPlanner'
import { progressiveClaimer } from './body/body'
import { needsClaim } from './scout'

export function needsClaimer(spawn: StructureSpawn, count: number) {
  return needsClaim(spawn) && !count
}

export function spawnClaimer(spawn: StructureSpawn) {
  const body = progressiveClaimer(
    spawn.room.energyAvailable,
    ClaimPlanner.instance.claimerDeaths,
  )
  const memory = { role: Role.CLAIMER, room: spawn.room.name, deprivity: 0 }
  spawn.trySpawnCreep(body, 'C', memory, false, 20)
}
