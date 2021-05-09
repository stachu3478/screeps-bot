import RoomNeighbourPathScanner from './RoomNeighbourPathScanner'
import RoomLocation from 'overloads/room/RoomLocation'

interface RoomPathScannerConfig {
  maxCost: number
}
export default class RoomPathScanner {
  private room: Room
  private config: RoomPathScannerConfig
  private traversed: boolean = false
  private infos: { [key: string]: RoomNeighbourPath | undefined } = {}
  private scanned: { [key: string]: 1 | undefined } = {}

  constructor(room: Room, config: RoomPathScannerConfig) {
    this.room = room
    this.config = config
  }

  traverse() {
    if (this.traversed) return
    if (!this.scanned[this.room.name]) {
      this.traversePos(this.room.sources.colonyPosition)
      this.scanned[this.room.name] = 1
      return
    }
    this.traversed = true
    Object.keys(this.infos).some((room) => {
      const info = this.infos[room]
      return !!info && this.traverseIfAvailable(info, room)
    })
  }

  private traverseIfAvailable(info: RoomNeighbourPath, roomName: string) {
    if (this.scanned[roomName]) return false
    const available = this.getOrRequestRoomAvailbility(roomName)
    if (available) {
      this.traversePos(new RoomPosition(info.x, info.y, roomName))
      this.scanned[roomName] = 1
      console.log('Room traversed: ', roomName)
    }
    this.traversed = false
    return true
  }

  private getOrRequestRoomAvailbility(roomName: string) {
    const room = Game.rooms[roomName]
    if (!room) {
      const observer = this.room.observer
      if (observer)
        console.log(
          roomName,
          'not found, observing from',
          this.room.name,
          observer.observeRoom(roomName),
        )
      // TODO else send scouts here
    }
    return !!room
  }

  private traversePos(pos: RoomPosition) {
    const scanResult = new RoomNeighbourPathScanner(
      Game.rooms[pos.roomName],
    ).findExitPaths(pos)
    const roomLocation = new RoomLocation(pos.roomName)
    scanResult.forEach((path) => {
      const roomName = roomLocation.getNeighbour(path.dir)
      const existingPath = this.infos[roomName]
      const currentRoomPath = this.infos[pos.roomName]
      const cost = (currentRoomPath ? currentRoomPath.cost : 0) + path.cost
      if (cost > this.config.maxCost) return
      if (existingPath && existingPath.cost <= cost) return
      this.infos[roomName] = {
        cost,
        x: path.x,
        y: path.y,
        through: pos.roomName,
      }
    })
    return true
  }

  /*private get infos() {
    const memorizedInfos = this.room.memory[RoomMemoryKeys.roomNeighbourPaths]
    if (memorizedInfos) return memorizedInfos
    const infos =
    return this.room.memory[RoomMemoryKeys.roomNeighbourPaths] = infos
  }*/
}
