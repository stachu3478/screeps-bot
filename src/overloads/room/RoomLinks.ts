export default class RoomLinks {
  private room: Room

  constructor(room: Room) {
    this.room = room
  }

  get finished() {
    const linkCharArray = (this.room.memory.links || '')
      .concat(this.room.memory.controllerLink || '')
      .split('')
    return (
      linkCharArray.length > 0 &&
      linkCharArray.every(
        (char) => !!this.room.buildingAt(char.charCodeAt(0), STRUCTURE_LINK),
      )
    )
  }

  get spawny() {
    const structurePosns = this.room.memory.structs
    if (!structurePosns) return
    return this.room.buildingAt(structurePosns.charCodeAt(0), STRUCTURE_LINK)
  }

  get controller() {
    const linkPos = this.room.memory.controllerLink || ''
    return this.room.buildingAt(linkPos.charCodeAt(0), STRUCTURE_LINK)
  }

  get drains() {
    const linkPoses = this.room.memory.links || ''
    return linkPoses
      .split('')
      .map((p) => this.room.buildingAt(p.charCodeAt(0), STRUCTURE_LINK))
      .filter((l) => l) as StructureLink[]
  }
}
