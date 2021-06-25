import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
import RemoteMiningPlanner from 'planner/remoteMining/RemoteMiningPlanner'
import { Collector, CollectorMemory } from 'role/creep/collector'
import { progressiveLiteWorker } from './body/work'
import SpawnCreep from './spawnCreep'

export default class SpawnCollector extends SpawnCreep {
  private missingRemoteLookup?: Lookup<RoomPosition>
  private missingCarry = 0
  protected minEnergy = 2500
  protected allowWhenEnergyFull = true

  run() {
    if (!this.missingRemoteLookup) {
      throw new Error('Missing remote lookup for new creep to assign')
    }
    const sourceMemory = MemoryHandler.sources[this.missingRemoteLookup]
    const memory: CreepMemory = {
      role: this.role,
      room: this.spawn.room.name,
      deprivity: sourceMemory.cost * 2,
      collect: this.missingRemoteLookup,
    }
    const body = progressiveLiteWorker(
      this.spawn.room.energyAvailable,
      this.missingCarry + 3,
    )
    this.spawn.trySpawnCreep(body, 'H', memory, false, 10)
  }

  needs() {
    if (super.needs()) {
      this.missingRemoteLookup = this.findMissingCollector()
    }
    return !!this.missingRemoteLookup
  }

  static success(name: string, body: BodyPartConstant[]) {
    const memory = Memory.creeps[name] as CollectorMemory
    const cost = _.sum(body, (type) => BODYPART_COST[type])
    MemoryHandler.sources[memory.collect].haulerCreeps.push(name)
    Game.rooms[memory.room].remoteMiningMonitor.monit(-cost)
  }

  private findMissingCollector() {
    const remoteMemory = this.spawn.room.memory.r || []
    const missingRemoteLookup = remoteMemory.find((lookup) => {
      const memory = MemoryHandler.sources[lookup]
      if (!memory) {
        RemoteMiningPlanner.removeSource(this.spawn.room, lookup)
        return false
      }
      const position = RoomPosition.from(memory.miningPosition)
      const room = Game.rooms[position.roomName]
      if (!room) {
        return false
      }
      const container = position.building(STRUCTURE_CONTAINER)
      if (!container) {
        return false
      }
      const carryNeeded = memory.carryNeeded
      const currentCarry = _.sum(memory.haulerCreeps, (name) => {
        return this.getCarryCount(name, lookup)
      })
      this.missingCarry = carryNeeded - currentCarry
      return this.missingCarry > 0
    })

    if (missingRemoteLookup) {
      const missingMemory = MemoryHandler.sources[missingRemoteLookup]
      missingMemory.haulerCreeps = missingMemory.haulerCreeps.filter(
        (c) => this.getCarryCount(c, missingRemoteLookup) !== 0,
      )
    }
    return missingRemoteLookup
  }

  private getCarryCount(creepName: string, target: string) {
    const creep = Game.creeps[creepName] as Collector
    if (!creep || creep.isRetired) {
      return 0
    }
    const targetMatches = creep.memory.collect === target
    if (!targetMatches) {
      return 0
    }
    return creep.corpus.count(CARRY)
  }

  get role(): Role.COLLECTOR {
    return Role.COLLECTOR
  }
}
