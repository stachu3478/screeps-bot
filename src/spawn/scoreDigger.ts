import { scorer, scoreDigger } from './body/body'

export function needsScoreDigger(spawn: StructureSpawn, count: number) {
  return (
    count < 3 &&
    spawn.room.memory._dig &&
    spawn.room.energyAvailable === spawn.room.energyCapacityAvailable
  )
}

export function spawnScoreDigger(spawn: StructureSpawn) {
  const memory = {
    role: Role.SCORE_DIGGER,
    room: spawn.room.name,
    deprivity: 100,
  }
  spawn.trySpawnCreep(
    scoreDigger(spawn.room.energyAvailable),
    'I',
    memory,
    false,
    10,
  )
}
