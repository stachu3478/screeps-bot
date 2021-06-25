import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
import { getCarryNeeded } from '../opts'
import RemoteMiningValidator from './RemoteMiningValidator'
import RemoteSourceValidator from './RemoteSourceValidator'

export default class RemoteMiningPlanner {
  private path: RoomNeighbourPath
  private room: Room
  private inspectorRoom: Room
  private validator: RemoteMiningValidator

  constructor(path: RoomNeighbourPath, room: Room, inspectorRoom: Room) {
    this.path = path
    this.room = room
    this.inspectorRoom = inspectorRoom
    this.validator = new RemoteMiningValidator(room.name, inspectorRoom)
  }

  static removeSource(room: Room, lookup: Lookup<RoomPosition>) {
    const memory = MemoryHandler.sources[lookup]
    console.log(
      'Bad remote spot removed',
      memory.cost,
      RoomPosition.from(lookup),
    )
    const remoteMemory = room.memory.r || []
    delete MemoryHandler.sources[lookup]
    room.memory.r = remoteMemory.filter((l) => l !== lookup)
  }

  run() {
    if (!this.validator.validateRoom()) {
      return
    }
    const sources = this.room.find(FIND_SOURCES)
    sources.forEach((source) => this.runForSource(source))
  }

  private runForSource(source: Source) {
    const sourceValidator = new RemoteSourceValidator(this.path, source)
    if (!sourceValidator.valid) {
      return
    }
    const path = sourceValidator.path
    const lookup = sourceValidator.sourceLookup
    const cost = sourceValidator.cost
    console.log('New remote spot found', cost, source.pos)
    const miningPosition = _.last(path.path).lookup
    const energyCapacity = this.getSourceCapacity(source)
    MemoryHandler.sources[lookup] = {
      cost,
      miningPosition,
      energyCapacity,
      miningCreep: '',
      haulerCreeps: [],
      carryNeeded: getCarryNeeded(cost, energyCapacity),
    }
    this.remoteMemory.push(lookup)
  }

  private getSourceCapacity(source: Source) {
    if (source.energyCapacity === SOURCE_ENERGY_KEEPER_CAPACITY) {
      return source.energyCapacity
    }
    return SOURCE_ENERGY_CAPACITY
  }

  get remoteMemory() {
    if (!this.memory.r) {
      this.memory.r = []
    }
    return this.memory.r
  }

  private get memory() {
    return this.inspectorRoom.memory
  }
}
