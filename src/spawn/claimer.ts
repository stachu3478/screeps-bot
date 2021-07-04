import ClaimPlanner from 'planner/military/ClaimPlanner'
import { progressiveClaimer } from './body/body'

const claimerThreshold = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
function needsClaim(spawn: StructureSpawn) {
  if (spawn.room.memory._attack) return false
  if (spawn.room.energyCapacityAvailable < claimerThreshold) return false
  const target = ClaimPlanner.instance.target
  return target && target.source === spawn.room.name
}

export function needsClaimer(spawn: StructureSpawn, count: number) {
  return needsClaim(spawn) && !count
}

export function spawnClaimer(spawn: StructureSpawn) {
  const body = progressiveClaimer(
    spawn.room.energyAvailable,
    ClaimPlanner.instance.claimerDeaths,
  )
  const memory = { role: Role.CLAIMER }
  spawn.trySpawnCreep(body, 'C', memory, false, 20)
}
