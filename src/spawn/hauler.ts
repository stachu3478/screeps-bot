import { carryPacks } from './body/body'

export function needsHauler(spawn: StructureSpawn, count: number) {
  return spawn.room.memory._haul && !count && spawn.room.storage
}

export function spawnHauler(spawn: StructureSpawn) {
  const mem = spawn.room.memory
  mem._haulSize = mem._haulSize ? mem._haulSize + 1 : 5
  if (mem._haulSize > 25) mem._haulSize = 25
  spawn.trySpawnCreep(carryPacks(mem._haulSize), 'H', {
    role: Role.HAULER,
    room: spawn.room.name,
    deprivity: 10,
  })
}
