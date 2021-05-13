import ClaimPlanner from 'planner/military/ClaimPlanner'

const claimerThreshold = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
export function needsClaim(spawn: StructureSpawn) {
  if (spawn.room.memory._attack) return false
  if (spawn.room.energyCapacityAvailable < claimerThreshold) return false
  const target = ClaimPlanner.instance.target
  return target && target.source === spawn.room.name
}

export function needsScout(spawn: StructureSpawn, count: number) {
  return !spawn.room.cache.scoutsWorking && spawn.room.pathScanner.scanTarget
}

export function spawnScout(spawn: StructureSpawn) {
  spawn.trySpawnCreep([MOVE], 'S', {
    role: Role.SCOUT,
    room: spawn.room.name,
    deprivity: 0,
  })
}
