import MemoryHandler from 'handler/MemoryHandler'
import { RemoteMiner } from 'role/creep/remoteMiner'
import { ranger } from './body/body'

function isValidRemoteMiner(creepName: string, target: string) {
  const creep = Game.creeps[creepName] as RemoteMiner
  if (!creep) {
    return false
  }
  if (creep.isRetired) {
    return false
  }
  return creep.memory.mine !== target
}

export function needsRemoteMiner(spawn: StructureSpawn) {
  const remoteMemory = spawn.room.memory.r || []
  const missingRemoteMiner = remoteMemory.find((lookup) => {
    const memory = MemoryHandler.sources[lookup]
    const minerName = memory.miningCreep
    return !isValidRemoteMiner(minerName, lookup)
  })
  return missingRemoteMiner
}

export function spawnRemoteMiner(spawn: StructureSpawn) {
  const memory = {
    role: Role.RANGER,
    room: spawn.room.name,
    deprivity: 0,
  }
  spawn.trySpawnCreep(ranger(), 'R', memory, false, 10)
}
