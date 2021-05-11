export default class RoomInspector {
  private room: Room

  constructor(room: Room) {
    this.room = room
  }

  inspectInto(
    room: Room,
    info: RoomNeighbourPath,
    startingPosition: RoomPosition,
  ) {
    info.owner = this.room.owner
    const controller = this.room.controller
    if (controller) this.inspectController(info, controller, startingPosition)
    info.sources = this.room.find(FIND_SOURCES).length
    info.safe = this.checkSafety(room, info)
  }

  private checkSafety(room: Room, info: RoomNeighbourPath) {
    if (info.safe === false) return false
    if (room.owner === this.room.owner) return true
    return !this.room
      .find(FIND_STRUCTURES)
      .filter((s) => s.structureType === STRUCTURE_TOWER && s.isActive()).length
  }

  private inspectController(
    info: RoomNeighbourPath,
    controller: StructureController,
    pos: RoomPosition,
  ) {
    info.controller = true
    const path = pos.findPathTo(controller, {
      maxRooms: 1,
      ignoreCreeps: true,
    })
    const aim = path[path.length - 1]
    info.controllerFortified =
      aim.x !== controller!.pos.x && aim.y !== controller!.pos.y
  }
}
