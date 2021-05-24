import _ from 'lodash'

interface ControllerRoom extends Room {
  controller: StructureController
}

export default class MyRooms {
  private static lastAdded: Set<string> = new Set()

  static get() {
    const rooms = Object.keys(Memory.myRooms)
      .filter((n) => {
        const room = this.getControlledRoom(n)
        if (!room && _.isEmpty(Memory.rooms[n]?.creeps)) {
          this.remove(n)
          return false
        }
        return true
      })
      .map((n) => Game.rooms[n] as ControllerRoom)
    if (!rooms.length) this.addFirst()
    return rooms
  }

  static add(room: Room, claimerRoom?: Room) {
    this.lastAdded.add(room.name)
    Memory.myRooms[room.name] = 0
    if (!claimerRoom) return
    const claimerRoomName = claimerRoom.name
    room.memory._claimer = claimerRoomName
    const mem = Memory.rooms[claimerRoomName]
    if (!mem._claimed) mem._claimed = []
    mem._claimed.push(room.name)
  }

  static remove(name: string) {
    if (this.lastAdded.has(name)) return
    delete Memory.myRooms[name]
    delete Memory.rooms[name]
  }

  static addFirst = (game = Game, memory = Memory) => {
    // Automatically add first room to owned if there are none
    if (!memory.myRooms) memory.myRooms = {}
    if (!Object.keys(memory.myRooms)[0]) {
      const room = _.find(game.rooms)
      if (room) MyRooms.add(room)
    }
  }

  private static getControlledRoom(name: string): ControllerRoom | undefined {
    const room = Game.rooms[name]
    if (!room?.controller?.my) return
    return room as ControllerRoom
  }
}
