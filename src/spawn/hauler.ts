import { carryPacks } from './body/body'

export function needsHauler(spawn: StructureSpawn, count: number) {
  return !!(
    !count &&
    spawn.room.storage &&
    spawn.room.filled &&
    spawn.room.memory._haul &&
    spawn.room.memory._haul !== spawn.room.name
  )
}

export function spawnHauler(spawn: StructureSpawn) {
  const mem = spawn.room.memory
  mem._haulSize = mem._haulSize ? mem._haulSize + 1 : 5
  if (mem._haulSize > 25) mem._haulSize = 25
  const carryPackCount = Math.min(
    mem._haulSize,
    25,
    Math.floor(spawn.room.energyAvailable / 100),
  )
  spawn.trySpawnCreep(carryPacks(carryPackCount), 'H', {
    role: Role.HAULER,
    room: spawn.room.name,
    deprivity: 10,
  })
}
