import remoteMining from 'config/remoteMining'
import player from 'constants/player'
import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
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

  static shouldMineIn(room: Room, inspectorRoom: Room) {
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
    const roomPath = inspectorRoom.pathScanner.rooms[room.name]
    if (!roomPath || !roomPath.safe) {
      return false
    }
    return true
  }

  run() {
    if (!RemoteMiningPlanner.shouldMineIn(this.room, this.inspectorRoom)) {
      return
    }
    if (this.path.cost > remoteMining.sources.maxCost) {
      return
    }
    if (!this.path.safe) {
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
    const path = PathFinder.search(this.entryPosition, {
      pos: source.pos,
      range: 1,
    })
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
      this.plannerPathMatrix = new PathMatrix(this.room.getTerrain())
    }
    return this.plannerPathMatrix
  }

  private get memory() {
    return this.inspectorRoom.memory
  }
}
