import { MinerMemory } from 'role/creep/miner'
import { progressiveMiner } from './body/work'

export function needsNextMiner(spawn: StructureSpawn, count: number) {
  const room = spawn.room
  const maxMiners = room.memory[RoomMemoryKeys.sourceInfo]?.length || 0
  return count < maxMiners && room.sources.free !== -1
}

export function spawnNextMiner(spawn: StructureSpawn) {
  const parts = progressiveMiner(spawn.room.energyCapacityAvailable)
  const freeSource = spawn.room.sources.free
  if (freeSource === -1) return
  spawn.cache.sourceId = freeSource
  const spec = spawn.room.sources.getDistance(freeSource)
  const memory: MinerMemory = {
    role: Role.MINER,
    room: spawn.room.name,
    deprivity: spec,
  }
  spawn.trySpawnCreep(parts, 'M', memory)
}
