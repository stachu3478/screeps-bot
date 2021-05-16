import _ from 'lodash'

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
    if (room.owner === this.room.owner) return true
    const entryPosition = new RoomPosition(
      info.x,
      info.y,
      info.name,
    ).disbordered()
    const towers = this.room
      .find(FIND_STRUCTURES)
      .filter(
        (s) => s.structureType === STRUCTURE_TOWER && s.isActive(),
      ) as StructureTower[]
    const entranceTowerDamage = _.sum(towers, (t) =>
      t.attackPowerAt({ pos: entryPosition }),
    )
    info.entranceDamage = entranceTowerDamage
    if (info.safe === false) return false
    return info.entranceDamage === 0
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
