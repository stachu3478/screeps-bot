export type StructureSelector = (r: Room) => Structure[]

export default class StructureMatcher {
  private matcher: StructureSelector

  constructor(rule: StructureConstant | StructureSelector) {
    if (typeof rule === 'string') {
      this.matcher = (room) => this.findStructure(room, rule)
    } else {
      this.matcher = rule
    }
  }

  call(room: Room) {
    return this.matcher(room)
  }

  matches(s: Structure) {}

  private findStructure(room: Room, rule: StructureConstant) {
    return room.buildings.get(rule)
  }
}
