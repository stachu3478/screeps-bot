import _ from 'lodash'
import RoomLocation from 'overloads/room/RoomLocation'

const instance = _.memoize(() => new ObservingScanner())
export default class ObservingScanner {
  private scanned: { [key: string]: 1 | undefined }
  private observerRooms: string[]
  private scanningRoom?: string
  private scannedX?: number
  private scannedY?: number
  private scannedRoom?: string

  constructor() {
    this.scanned = {}
    this.observerRooms = Object.keys(Memory.myRooms)
    this.scanningRoom = this.observerRooms.pop()
  }

  scan(callback: (room: Room) => any) {
    const observer = this.findObserver()
    if (!observer) return false
    const name = this.scannedRoom || this.findRoomToScan(observer)
    if (!name) {
      console.log('No room to scan ', name)
      delete this.scanningRoom
      return true
    }
    const room = Game.rooms[name]
    if (!room) {
      console.log('Scanning ', name)
      this.scannedRoom = name
      observer.observeRoom(name)
    } else {
      console.log('Scanned ', name)
      this.scanned[name] = 1
      delete this.scannedRoom
      callback(room)
    }
    return true
  }

  filterToScanFromPathScanners() {
    this.observerRooms.forEach((n) => {
      const rooms = Game.rooms[n]?.pathScanner.rooms
      if (!rooms) return
      Object.keys(rooms).forEach((n) => {
        this.scanned[n] = 1
      })
    })
  }

  private findObserver() {
    const currentRoom = Game.rooms[this.scanningRoom || '']
    let observer = currentRoom?.buildings.observer
    while (!observer) {
      this.scanningRoom = this.observerRooms.pop()
      if (!this.scanningRoom) return
      const newRoom = Game.rooms[this.scanningRoom]
      observer = newRoom?.buildings.observer
      if (observer) {
        delete this.scannedX
        delete this.scannedY
      }
    }
    return observer
  }

  private findRoomToScan(observer: StructureObserver): string | void {
    while (this.scanningRoom) {
      const location = observer.room.location
      if (
        typeof this.scannedX === 'undefined' ||
        this.scannedX > location.x + OBSERVER_RANGE
      ) {
        this.scannedX = location.x - OBSERVER_RANGE
        if (typeof this.scannedY === 'undefined') {
          this.scannedY = location.y - OBSERVER_RANGE
        } else {
          this.scannedY++
        }
        if (this.scannedY > location.y + OBSERVER_RANGE)
          delete this.scanningRoom
      }
      if (typeof this.scannedY === 'undefined')
        this.scannedY = location.y - OBSERVER_RANGE
      const name = RoomLocation.reverseIndex(this.scannedX, this.scannedY)
      this.scannedX++
      if (!this.scanned[name]) return name
    }
  }

  static get instance() {
    return instance()
  }
}
