import remoteMining from 'config/remoteMining'
import MemoryHandler from 'handler/MemoryHandler'
import { roomCallback } from 'utils/path'

export default class RemoteSourceValidator {
  private roomPath: RoomNeighbourPath
  private source: Source
  private entryPosition: RoomPosition
  private sourcePath?: PathFinderPath

  constructor(roomPath: RoomNeighbourPath, source: Source) {
    this.roomPath = roomPath
    this.source = source
    this.entryPosition = new RoomPosition(
      roomPath.newX,
      roomPath.newY,
      roomPath.name,
    )
  }

  get valid() {
    if (MemoryHandler.sources[this.sourceLookup]) {
      console.log('source already locked', this.entryPosition.roomName)
      return
    }
    return !this.path.incomplete && this.cost <= remoteMining.sources.maxCost // todo send dismantlers to clear path
  }

  get path() {
    if (!this.sourcePath) {
      this.sourcePath = PathFinder.search(
        this.entryPosition,
        { pos: this.source.pos, range: 1 },
        {
          plainCost: 1,
          swampCost: 1,
          maxRooms: 1,
          roomCallback,
        },
      )
    }
    return this.sourcePath
  }

  get sourceLookup() {
    return this.source.pos.lookup
  }

  get cost() {
    return this.path.cost + this.roomPath.cost
  }
}
