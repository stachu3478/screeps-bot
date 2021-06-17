import remoteMining from 'config/remoteMining'
import MemoryHandler from 'handler/MemoryHandler'
import RemoteMiningPlanner from 'planner/RemoteMiningPlanner'
import { RemoteMiner, RemoteMinerMemory } from 'role/creep/remoteMiner'
import { progressiveMiner } from './body/work'

export default class SpawnRemoteMiner {
  private spawn: StructureSpawn
  private missingRemoteLookup?: string

  constructor(spawn: StructureSpawn) {
    this.spawn = spawn
    if (this.satisfiesEnergy) {
      this.missingRemoteLookup = this.findMissingRemoteMiner()
      if (this.missingRemoteLookup) {
        console.log(this.missingRemoteLookup, 'found missing miner')
      }
    }
  }

  run() {
    if (!this.missingRemoteLookup) {
      throw new Error('Missing remote lookup for new creep to assign')
    }
    const sourceMemory = MemoryHandler.sources[this.missingRemoteLookup]
    const memory: RemoteMinerMemory = {
      role: Role.REMOTE_MINER,
      room: this.spawn.room.name,
      deprivity: sourceMemory.cost,
      mine: this.missingRemoteLookup as Lookup<RoomPosition>,
    }
    const overloadCapacity =
      sourceMemory.energyCapacity * remoteMining.sources.workParkOverload
    this.spawn.trySpawnCreep(
      progressiveMiner(this.spawn.room.energyAvailable, overloadCapacity),
      'T',
      memory,
      false,
      10,
    )
    return true
  }

  needs() {
    return !!this.missingRemoteLookup
  }

  private get satisfiesEnergy() {
    return (
      this.spawn.room.energyAvailable >= 1300 ||
      this.spawn.room.energyAvailable ===
        this.spawn.room.energyCapacityAvailable
    )
  }

  private findMissingRemoteMiner() {
    const remoteMemory = this.spawn.room.memory.r || []
    const missingRemoteLookup = remoteMemory.find((lookup) => {
      const memory = MemoryHandler.sources[lookup]
      if (!memory) {
        this.removeSource(lookup)
        return false
      }
      const minerName = memory.miningCreep
      const position = RoomPosition.from(memory.miningPosition)
      const room = Game.rooms[position.roomName]
      if (room && !RemoteMiningPlanner.shouldMineIn(room, this.spawn.room)) {
        this.removeSource(lookup)
        return false
      }
      return !this.isValidRemoteMiner(minerName, lookup)
    })
    return missingRemoteLookup
  }

  private removeSource(lookup: Lookup<RoomPosition>) {
    const remoteMemory = this.spawn.room.memory.r || []
    delete MemoryHandler.sources[lookup]
    this.spawn.room.memory.r = remoteMemory.filter((l) => l !== lookup)
  }

  private isValidRemoteMiner(creepName: string, target: string) {
    const creep = Game.creeps[creepName] as RemoteMiner
    if (!creep) {
      console.log('No creep!', creepName)
      return false
    }
    if (creep.isRetired) {
      console.log('Creep retired!')
      return false
    }
    const targetMatches = creep.memory.mine === target
    if (!targetMatches) {
      console.log('No matching target!', creep.memory.mine, target)
    }
    return creep.memory.mine === target
  }
}
