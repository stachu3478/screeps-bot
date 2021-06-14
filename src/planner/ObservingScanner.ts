import _ from 'lodash'
import RoomLocation from 'overloads/room/RoomLocation'
import MyRooms from 'room/MyRooms'

const instance = _.memoize(() => new ObservingScanner())
export default class ObservingScanner {
  private scanned: { [key: string]: 1 | undefined }
  private observerRooms: string[]
  private scanningRoom?: string
  private scannedX?: number
  private scannedY?: number
  private scannedRoom?: string
  private lastRoomIndex = -1

  constructor() {
    this.scanned = {}
    this.observerRooms = Object.keys(MyRooms.findOrInitialize())
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
      const res = observer.observeRoom(name)
      if (res === ERR_NOT_IN_RANGE) {
        delete this.scanningRoom
        delete this.scannedRoom
      }
    } else {
      console.log('Scanned ', name)
      this.scanned[name] = 1
      delete this.scannedRoom
      callback(room)
    }
    return true
  }

  filterToScanFromPathScanners(myRooms = MyRooms) {
    myRooms.get().forEach((room) => {
      Object.keys(room.pathScanner.rooms).forEach((n) => {
        this.scanned[n] = 1
      })
    })
  }

  private findObserver() {
    let observer: StructureObserver | undefined
    while (!observer && this.lastRoomIndex < this.observerRooms.length) {
      if (!this.scanningRoom) {
        this.lastRoomIndex++
        this.scanningRoom = this.observerRooms[this.lastRoomIndex]
      }
      const currentRoom = Game.rooms[this.scanningRoom || '']
      observer = currentRoom?.buildings.observer
      if (!observer) {
        delete this.scanningRoom
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
          if (this.scannedY > location.y + OBSERVER_RANGE) {
            delete this.scannedX
            delete this.scannedY
            return
          }
        }
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
