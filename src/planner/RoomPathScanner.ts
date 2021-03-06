import _ from 'lodash'
import RoomNeighbourPathScanner from './RoomNeighbourPathScanner'
import RoomLocation from 'overloads/room/RoomLocation'
import RoomInspector from './RoomInspector'
import MyRooms from 'room/MyRooms'

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

  // to do move mothod to other class
  getMaxDamage(roomName: string) {
    let info = this.infos[roomName]
    if (!info || _.isUndefined(info.maxTowerDamage)) return
    let dmg = info.maxTowerDamage || 0
    while (this.room.name !== info.through) {
      info = this.infos[info.through]
      if (!info) return
      dmg = Math.max(info.maxTowerDamage || 0, dmg)
    }
    return dmg
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
    if (this.traversedTick === Game.time || Game.cpu.bucket < 1000) return
    this.traversedTick = Game.time
    if (this.traversed) return
    if (!this.scanned[this.room.name]) {
      this.traversePos(this.room.sources.colonyPosition)
      this.scanned[this.room.name] = 1
      return
    }
    this.traversed = !Object.keys(this.infos).some((room) => {
      const info = this.infos[room]
      return !!info && this.traverseIfAvailable(info, room)
    })
    if (this.traversed) console.log('traversing done')
  }

  private traverseIfAvailable(info: RoomNeighbourPath, roomName: string) {
    if (this.scanned[roomName]) return false
    const observer = this.findObserver(roomName)
    if (info.safe === false && !observer) return false
    const available = this.getOrRequestRoomAvailbility(roomName, observer)
    if (available) {
      this.traversePos(new RoomPosition(info.newX, info.newY, roomName))
      this.scanned[roomName] = 1
      delete this.toBeTraversed
    }
    return true
  }

  private getOrRequestRoomAvailbility(
    roomName: string,
    observer?: StructureObserver,
  ) {
    const room = Game.rooms[roomName]
    if (!room) {
      if (observer) {
        observer.observeRoom(roomName)
        this.room.visual.info(
          'Trying to observe room ' + roomName + ' with ' + observer,
          0,
          11,
        )
      } else {
        this.toBeTraversed = roomName
        this.room.visual.info('Trying to scout room ' + roomName, 0, 11)
      }
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
      if (existingPath) {
        if (existingPath.cost <= cost) {
          return
        }
        if (currentRoomPath && existingPath.safe && !currentRoomPath.safe) {
          return
        }
      }
      this.infos[roomName] = {
        ...path,
        name: roomName,
        cost,
        through: pos.roomName,
        safe: currentRoomPath ? currentRoomPath.safe : true,
        deposits: [],
      }
    })
    this.room.visual.info('Scanned ' + room, 0, 11)
    return true
  }

  private findObserver(room: string) {
    const location = new RoomLocation(room)
    const myObserver = this.room.buildings.observer
    if (myObserver && location.inRangeTo(this.room, OBSERVER_RANGE)) {
      return myObserver
    }
    return MyRooms.get()
      .map((r) => r.buildings.observer)
      .find((o) => o && location.inRangeTo(o.room, OBSERVER_RANGE))
  }
}
