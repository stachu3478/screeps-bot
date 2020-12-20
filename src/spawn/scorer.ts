import { scorer } from './body/body'

export function needsScorer(spawn: StructureSpawn, count: number) {
  return (
    !count &&
    spawn.room.memory._score &&
    spawn.room.store('score' as ResourceConstant) > 1200 &&
    spawn.room.energyAvailable >= 400
  )
}

export function spawnScorer(spawn: StructureSpawn) {
  const memory = {
    role: Role.SCORER,
    room: spawn.room.name,
    deprivity: 50,
  }
  spawn.trySpawnCreep(
    scorer(
      spawn.room.energyAvailable,
      spawn.room.store('score' as ResourceConstant),
    ),
    'O',
    memory,
    false,
    10,
  )
}
