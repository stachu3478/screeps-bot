export function needsMover(spawn: StructureSpawn, count: number) {
  return (
    !count &&
    spawn.room.memory._moveNeeds &&
    spawn.room.memory._dig &&
    spawn.room.energyAvailable >= Math.ceil(spawn.room.energyCapacityAvailable)
  )
}

export function spawnMover(spawn: StructureSpawn) {
  const memory = { role: Role.MOVER, deprivity: 10 }
  const moveParts = Math.min(
    spawn.room.energyAvailable / 50,
    spawn.room.memory._moveNeeds || 0,
  )
  spawn.trySpawnCreep(new Array(moveParts).fill(MOVE), 'V', memory, false, 10)
}
