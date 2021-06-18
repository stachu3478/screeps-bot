import remoteMining from 'config/remoteMining'
import player from 'constants/player'
import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
import { getCarryNeeded } from './opts'
import PathMatrix from './PathMatrix'

export default class RemoteMiningPlanner {
  private path: RoomNeighbourPath
  private room: Room
  private inspectorRoom: Room
  private plannerPathMatrix?: PathMatrix
  private entryPosition: RoomPosition

  constructor(path: RoomNeighbourPath, room: Room, inspectorRoom: Room) {
    this.path = path
    this.room = room
    this.inspectorRoom = inspectorRoom
    this.entryPosition = new RoomPosition(path.newX, path.newY, room.name)
  }

  static shouldMineIn(name: string, inspectorRoom: Room) {
    const roomPath = inspectorRoom.pathScanner.rooms[name]
    if (!roomPath || !roomPath.safe) {
      return false
    }
    const room = Game.rooms[name]
    if (!room) {
      return true
    }
    const sources = room.find(FIND_SOURCES)
    const hostiles = room.find(FIND_HOSTILE_CREEPS)
    if (
      hostiles.some(
        (h) => h.corpus.count(WORK) && sources.some((s) => h.pos.isNearTo(s)),
      )
    ) {
      return false
    }
    const controller = room.controller
    if (!controller) {
      return true
    }
    if (controller.owner?.username) {
      return false
    }
    const reservation = controller.reservation
    if (!reservation) {
      return true
    }
    if (reservation.username !== player) {
      return false
    }

    return true
  }

  static removeSource(room: Room, lookup: Lookup<RoomPosition>) {
    const remoteMemory = room.memory.r || []
    delete MemoryHandler.sources[lookup]
    room.memory.r = remoteMemory.filter((l) => l !== lookup)
  }

  run() {
    if (!RemoteMiningPlanner.shouldMineIn(this.room.name, this.inspectorRoom)) {
      return
    }
    if (this.path.cost > remoteMining.sources.maxCost) {
      return
    }
    const sources = this.room.find(FIND_SOURCES)
    sources.forEach((source) => this.runForSource(source))
    if (this.plannerPathMatrix) {
      this.addRoadPositions(this.pathMatrix.positions)
    }
  }

  private runForSource(source: Source) {
    const lookup = source.pos.lookup
    if (MemoryHandler.sources[lookup]) {
      console.log('source already locked', this.room.name)
      return
    }
    const path = this.pathMatrix.findPath(this.entryPosition, source.pos, 1)
    if (path.incomplete) {
      return // todo send dismantlers to clear path
    }
    const cost = this.path.cost + path.cost
    if (cost > remoteMining.sources.maxCost) {
      return
    }
    const miningPosition = _.last(path.path).lookup
    const energyCapacity = this.getSourceCapacity(source)
    this.pathMatrix.addPath(path, this.entryPosition, source.pos)
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

  private addRoadPositions(roads: RoomPosition[]) {
    if (!this.memory.remoteRoads) {
      this.memory.remoteRoads = ''
    }
    this.memory.remoteRoads += roads.map((p) => p.lookup).join('')
  }

  get remoteMemory() {
    if (!this.memory.r) {
      this.memory.r = []
    }
    return this.memory.r
  }

  get pathMatrix() {
    if (!this.plannerPathMatrix) {
      this.plannerPathMatrix = new PathMatrix()
    }
    return this.plannerPathMatrix
  }

  private get memory() {
    return this.inspectorRoom.memory
  }
}
