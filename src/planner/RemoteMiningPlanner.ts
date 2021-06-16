import remoteMining from 'config/remoteMining'
import MemoryHandler from 'handler/MemoryHandler'
import _ from 'lodash'
import PathMatrix from './PathMatrix'

export default class RemoteMiningPlanner {
  private path: RoomNeighbourPath
  private room: Room
  private plannerPathMatrix?: PathMatrix
  private entryPosition: RoomPosition

  constructor(path: RoomNeighbourPath, room: Room) {
    this.path = path
    this.room = room
    this.entryPosition = new RoomPosition(path.newX, path.newY, room.name)
  }

  run() {
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
    if (!this.room.memory.remoteRoads) {
      this.room.memory.remoteRoads = ''
    }
    this.room.memory.remoteRoads += roads.map((p) => p.lookup).join('')
  }

  get remoteMemory() {
    if (!this.room.memory.r) {
      this.room.memory.r = []
    }
    return this.room.memory.r
  }

  get pathMatrix() {
    if (!this.plannerPathMatrix) {
      this.plannerPathMatrix = new PathMatrix(this.room.getTerrain())
    }
    return this.plannerPathMatrix
  }
}
