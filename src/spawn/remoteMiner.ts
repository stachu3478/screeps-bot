import remoteMining from 'config/remoteMining'
import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
import RemoteMiningPlanner from 'planner/remoteMining/RemoteMiningPlanner'
import RemoteMiningValidator from 'planner/remoteMining/RemoteMiningValidator'
import { progressiveMiner } from './body/work'
import SpawnCreep from './spawnCreep'

export default class SpawnRemoteMiner extends SpawnCreep {
  private missingRemoteLookup?: Lookup<RoomPosition>
  protected minEnergy = 2500
  protected allowWhenEnergyFull = true

  run() {
    if (!this.missingRemoteLookup) {
      throw new Error('Missing remote lookup for new creep to assign')
    }
    const sourceMemory = MemoryHandler.sources[this.missingRemoteLookup]
    const memory: CreepMemoryTraits = {
      role: this.role,
      deprivity: sourceMemory.cost,
      mine: this.missingRemoteLookup,
    }
    const overloadCapacity =
      sourceMemory.energyCapacity * remoteMining.sources.workParkOverload
    const body = progressiveMiner(
      this.spawn.room.energyAvailable,
      overloadCapacity,
    )
    this.spawn.trySpawnCreep(body, 'T', memory, false, 10)
  }

  needs() {
    if (super.needs()) {
      this.missingRemoteLookup = this.findMissingRemoteMiner()
    }
    return !!this.missingRemoteLookup
  }

  static success(name: string, body: BodyPartConstant[]) {
    const memory = Memory.creeps[name] as RoleCreepMemory<Role.REMOTE_MINER>
    const cost = _.sum(body, (type) => BODYPART_COST[type])
    MemoryHandler.sources[memory.mine].miningCreep = name
    Game.rooms[memory.room].remoteMiningMonitor.monit(-cost)
  }

  private findMissingRemoteMiner() {
    const remoteMemory = this.spawn.room.memory.r || []
    const missingRemoteLookup = remoteMemory.find((lookup) => {
      const memory = MemoryHandler.sources[lookup]
      if (!memory) {
        RemoteMiningPlanner.removeSource(this.spawn.room, lookup)
        return false
      }
      const minerName = memory.miningCreep
      const position = RoomPosition.from(memory.miningPosition)
      if (
        !new RemoteMiningValidator(
          position.roomName,
          this.spawn.room,
        ).validateRoom()
      ) {
        RemoteMiningPlanner.removeSource(this.spawn.room, lookup)
        return false
      }
      return !this.isValidRemoteMiner(minerName, lookup)
    })
    return missingRemoteLookup
  }

  private isValidRemoteMiner(creepName: string, target: string) {
    const creep = Game.creeps[creepName]
    if (!creep) {
      return false
    }
    if (creep.isRetired) {
      return false
    }
    const targetMatches = creep.memory.mine === target
    return targetMatches
  }

  get role() {
    return Role.REMOTE_MINER
  }
}
