import { getLink } from 'utils/selectFromPos'

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
    if (!this.room.memory.structs) return
    return getLink(this.room, this.room.memory.structs.charCodeAt(0))
  }

  get controller() {
    const linkPos = this.room.memory.controllerLink || ''
    return getLink(this.room, linkPos.charCodeAt(0))
  }

  get drains() {
    const linkPoses = this.room.memory.links || ''
    return linkPoses
      .split('')
      .map((p) => getLink(this.room, p.charCodeAt(0)))
      .filter((l) => l) as StructureLink[]
  }
}
