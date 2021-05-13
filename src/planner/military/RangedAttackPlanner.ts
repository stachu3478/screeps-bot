export default class RangedAttackPlanner {
  private target?: Creep | PowerCreep | Structure
  private mass = false

  constructor(room: Room, pos: RoomPosition) {
    const nearTarget = this.structuresAtArea(room, pos, 1)[0]
    if (nearTarget) {
      if ((nearTarget.structure as OwnedStructure).owner) this.mass = true
      else this.target = nearTarget.structure
    } else {
      const closeTarget = this.structuresAtArea(room, pos, 3)[0]
      this.target = closeTarget && closeTarget.structure
    }
  }

  apply(creep: Creep) {
    if (this.target) creep.rangedAttack(this.target)
    else if (this.mass) creep.rangedMassAttack()
    return !!(this.target || this.mass)
  }

  // todo omit storages containers etc
  private structuresAtArea(room: Room, pos: RoomPosition, range: number) {
    const minY = Math.max(0, pos.y - range)
    const minX = Math.max(0, pos.x - range)
    const maxY = Math.min(49, pos.y + range)
    const maxX = Math.min(49, pos.x + range)
    return room
      .lookForAtArea(LOOK_STRUCTURES, minY, minX, maxY, maxX, true)
      .filter(({ structure }) => structure.hits)
  }
}
