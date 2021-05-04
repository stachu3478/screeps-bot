import { progressiveFighter } from './body/body'

export function needsFighters(needs: boolean) {
  return needs
}

export function spawnFighter(spawn: StructureSpawn) {
  const energyUsed = Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable)
  const body = progressiveFighter(energyUsed)
  const memory = {
    role: Role.FIGHTER,
    room: spawn.room.name,
    deprivity: 0,
  }
  spawn.trySpawnCreep(body, 'F', memory)
}
