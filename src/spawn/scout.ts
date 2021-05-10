const claimerThreshold = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
export function needsClaim(spawn: StructureSpawn) {
  return (
    !spawn.room.memory._attack &&
    spawn.room.energyCapacityAvailable >= claimerThreshold
  )
}

export function needsScout(spawn: StructureSpawn, count: number) {
  return !count && spawn.room.pathScanner.scanTarget
}

export function spawnScout(spawn: StructureSpawn) {
  spawn.trySpawnCreep([MOVE], 'S', {
    role: Role.SCOUT,
    room: spawn.room.name,
    deprivity: 0,
  })
}
