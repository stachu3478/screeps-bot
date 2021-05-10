import RoomNeighbourPathScanner from './RoomNeighbourPathScanner'
import RoomLocation from 'overloads/room/RoomLocation'
import { infoStyle } from 'room/style'
import RoomInspector from './RoomInspector'

interface RoomPathScannerConfig {
  maxCost: number
}
export default class RoomPathScanner {
  private room: Room
  private config: RoomPathScannerConfig
  private traversed: boolean = false
  private infos: { [key: string]: RoomNeighbourPath | undefined } = {}
  private scanned: { [key: string]: 1 | undefined } = {}
  private traversedTick: number = 0
  private toBeTraversed?: string

  constructor(room: Room, config: RoomPathScannerConfig) {
    this.room = room
    this.config = config
  }

  get done() {
    this.traverse()
    return this.traversed
  }

  get rooms() {
    return this.infos
  }

  get scanTarget() {
    return this.toBeTraversed
  }

  private traverse() {
    if (this.traversedTick === Game.time) return
    this.traversedTick = Game.time
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
    if (this.traversed) console.log('traversing done')
  }

  private traverseIfAvailable(info: RoomNeighbourPath, roomName: string) {
    if (this.scanned[roomName]) return false
    const available = this.getOrRequestRoomAvailbility(roomName)
    if (available) {
      this.traversePos(new RoomPosition(info.x, info.y, roomName))
      this.scanned[roomName] = 1
    }
    this.traversed = false
    return true
  }

  private getOrRequestRoomAvailbility(roomName: string) {
    const room = Game.rooms[roomName]
    if (!room) {
      const observer = this.room.observer
      if (observer) observer.observeRoom(roomName)
      else this.toBeTraversed = roomName
      this.room.visual.text('Trying to scan room ' + roomName, 0, 11, infoStyle)
      // TODO else send scouts here
    }
    return !!room
  }

  private traversePos(pos: RoomPosition) {
    const room = Game.rooms[pos.roomName]
    const scanResult = new RoomNeighbourPathScanner(room).findExitPaths(pos)
    const roomLocation = new RoomLocation(pos.roomName)
    const currentRoomPath = this.infos[pos.roomName]
    const baseCost = currentRoomPath ? currentRoomPath.cost : 0
    if (currentRoomPath)
      new RoomInspector(room).inspectInto(this.room, currentRoomPath, pos)
    scanResult.forEach((path) => {
      const roomName = roomLocation.getNeighbour(path.dir)
      const existingPath = this.infos[roomName]
      const cost = baseCost + path.cost
      if (cost > this.config.maxCost) return
      if (existingPath && existingPath.cost <= cost) return
      this.infos[roomName] = {
        name: roomName,
        cost,
        x: path.x,
        y: path.y,
        through: pos.roomName,
        safe: currentRoomPath ? currentRoomPath.safe : true,
      }
    })
    this.room.visual.text('Scanned ' + room, 0, 11, infoStyle)
    return true
  }
}
