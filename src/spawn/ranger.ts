import { ranger } from './body/body'

export function needsRanger(spawn: StructureSpawn, count: number) {
  return (
    !count &&
    spawn.room.memory._rangedAttack &&
    spawn.room.energyAvailable >= 5500
  )
}

export function spawnRanger(spawn: StructureSpawn) {
  const memory = { role: Role.RANGER }
  spawn.trySpawnCreep(ranger(), 'R', memory, false, 10)
}
