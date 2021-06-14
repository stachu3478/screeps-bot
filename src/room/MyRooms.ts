import _ from 'lodash'

interface ControllerRoom extends Room {
  controller: StructureController
}

export default class MyRooms {
  private static lastAdded: Set<string> = new Set()

  static get() {
    const roomsMemory = MyRooms.findOrInitialize()
    const rooms = Object.keys(roomsMemory)
      .filter((n) => {
        const room = this.getControlledRoom(n)
        if (!room) {
          if (_.isEmpty(Memory.rooms[n]?.creeps)) {
            this.remove(n)
          }
          return false
        }
        return true
      })
      .map((n) => Game.rooms[n] as ControllerRoom)
    return rooms
  }

  static add(room: Room, claimerRoom?: Room) {
    this.lastAdded.add(room.name)
    if (Memory.myRooms) {
      Memory.myRooms[room.name] = 0
    }
    if (!claimerRoom) return
    const claimerRoomName = claimerRoom.name
    room.memory._claimer = claimerRoomName
    const mem = Memory.rooms[claimerRoomName]
    if (!mem._claimed) mem._claimed = []
    mem._claimed.push(room.name)
  }

  static remove(name: string) {
    if (this.lastAdded.has(name)) return
    if (Memory.myRooms) {
      delete Memory.myRooms[name]
    }
    delete Memory.rooms[name]
  }

  static findOrInitialize = (game = Game, memory = Memory) => {
    // Automatically add first room to owned if there are none
    if (!memory.myRooms) memory.myRooms = {}
    if (!Object.keys(memory.myRooms)[0]) {
      const room = _.find(game.rooms)
      if (room) MyRooms.add(room)
    }
    return memory.myRooms
  }

  private static getControlledRoom(name: string): ControllerRoom | undefined {
    const room = Game.rooms[name]
    if (!room?.controller?.my) return
    return room as ControllerRoom
  }
}
