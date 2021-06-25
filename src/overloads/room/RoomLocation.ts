import { stringify } from 'querystring'
import MyRooms from 'room/MyRooms'
import range from 'utils/range'

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

  getNeighbour(direction: FindExitConstant | string) {
    if (direction === FIND_EXIT_TOP)
      return RoomLocation.reverseIndex(this.x, this.y - 1)
    if (direction === FIND_EXIT_BOTTOM)
      return RoomLocation.reverseIndex(this.x, this.y + 1)
    if (direction === FIND_EXIT_LEFT)
      return RoomLocation.reverseIndex(this.x - 1, this.y)
    if (direction === FIND_EXIT_RIGHT)
      return RoomLocation.reverseIndex(this.x + 1, this.y)
    return direction.toString()
  }

  getRoomPath(current: string, to: string, using: Room) {
    const path = []
    const rooms = using.pathScanner.rooms
    let room = rooms[to]
    let next = to
    while (next !== current) {
      path.unshift(next)
      room = rooms[next]
      if (!room) return []
      next = room.through
    }
    path.unshift(current)
    return path
  }

  findRoomPathStep(
    current: string,
    to: string,
    using?: Room,
    myRooms = MyRooms,
  ): RoomNeighbourPath | undefined {
    const allRooms = myRooms.get()
    const found =
      (using && this.getRoomPathStep(current, to, using)) ||
      this.getReturnPath(current, to) ||
      this.getAnyRoomPathStep(current, to, allRooms) ||
      this.getAnyReturnPath(current, allRooms)
    if (found) {
      return found
    }
    if (to === this.roomName) {
      return this.getRoomPathToCenter()
    }
    return undefined
  }

  private getRoomPathStep(current: string, to: string, room: Room) {
    const rooms = room.pathScanner.rooms
    return rooms[this.getRoomPath(current, to, room)[1]]
  }

  private getAnyRoomPathStep(current: string, to: string, allRooms: Room[]) {
    let found: RoomNeighbourPath | undefined
    allRooms.some((r) => {
      const room = this.getRoomPathStep(current, to, r)
      if (room) {
        found = room
      }
      return !!room
    })
    return found
  }

  private getReturnPath(current: string, to: string, room = Game.rooms[to]) {
    const rooms = room?.pathScanner.rooms
    const currentRoom = rooms && rooms[current]
    return (
      currentRoom && {
        ...currentRoom,
        x: currentRoom.newX,
        y: currentRoom.newY,
        newX: currentRoom.x,
        newY: currentRoom.y,
        through: currentRoom.name,
        name: currentRoom.through,
      }
    )
  }

  private getAnyReturnPath(current: string, allRooms: Room[]) {
    let found: RoomNeighbourPath | undefined
    allRooms.some((r) => {
      found = this.getReturnPath(current, r.name, r)
      return !!found
    })
    return found
  }

  private getRoomPathToCenter() {
    return {
      x: 25,
      y: 25,
      newX: 25,
      newY: 25,
      name: this.roomName,
      cost: 0,
      through: this.roomName,
      deposits: [],
    }
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
