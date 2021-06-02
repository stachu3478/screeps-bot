import { FindExitConstant } from 'planner/RoomNeighbourPathScanner'
import MyRooms from 'room/MyRooms'
import range from 'utils/range'
import { reverseCord } from '../RoomPosition'

export default class RoomLocation {
  private roomName: string
  private index: [number, number]

  constructor(roomName: string) {
    this.roomName = roomName
    this.index = this.getIndex()
  }

  get x() {
    return this.index[0]
  }

  get y() {
    return this.index[1]
  }

  inRangeTo(room: Room, r: number) {
    const location = room.location
    return r >= range(this.x - location.x, this.y - location.y)
  }

  getNeighbour(direction: FindExitConstant) {
    let roomName: string = ''
    if (direction === FIND_EXIT_TOP)
      roomName = RoomLocation.reverseIndex(this.x, this.y - 1)
    if (direction === FIND_EXIT_BOTTOM)
      roomName = RoomLocation.reverseIndex(this.x, this.y + 1)
    if (direction === FIND_EXIT_LEFT)
      roomName = RoomLocation.reverseIndex(this.x - 1, this.y)
    if (direction === FIND_EXIT_RIGHT)
      roomName = RoomLocation.reverseIndex(this.x + 1, this.y)
    return roomName
  }

  findRoomPathStep(
    current: string,
    to: string,
    myRooms = MyRooms,
  ): RoomNeighbourPath | undefined {
    const allRooms = myRooms.get()
    let found: RoomNeighbourPath | undefined
    allRooms.some((r) => {
      const rooms = r.pathScanner.rooms
      let room = rooms[to]
      let next = to
      while (next !== current) {
        room = rooms[next]
        if (!room) return false
        next = room.through
      }
      if (room) found = room
      return !!room
    })

    if (found) {
      return found
    }
    allRooms.some((r) => {
      const rooms = r.pathScanner.rooms
      const currentRoom = rooms && rooms[current]
      found = currentRoom && {
        ...currentRoom,
        x: reverseCord(currentRoom.x),
        y: reverseCord(currentRoom.y),
        through: currentRoom.name,
        name: currentRoom.through,
      }
      return !!found
    })
    if (found) {
      return found
    }
    if (to === this.roomName) {
      return {
        x: 25,
        y: 25,
        name: this.roomName,
        cost: 0,
        through: this.roomName,
        deposits: [],
      }
    }
    return undefined
  }

  private getIndex(): [number, number] {
    let [, w, x, h, y] = this.roomName.split(/(W|E|N|S)/)
    let xPos = parseInt(x)
    let yPos = parseInt(y)
    if (w === 'W') xPos = -xPos - 1
    if (h === 'N') yPos = -yPos - 1
    return [xPos, yPos]
  }

  static reverseIndex(x: number, y: number) {
    let xAzymuth = 'E' + x
    let yAzymuth = 'S' + y
    if (x < 0) xAzymuth = 'W' + (-x - 1)
    if (y < 0) yAzymuth = 'N' + (-y - 1)
    return xAzymuth + yAzymuth
  }
}
