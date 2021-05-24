export default class RangedAttackPlanner {
  private target?: Creep | PowerCreep | Structure
  private mass = false

  constructor(pos: RoomPosition) {
    const nearTarget = this.structuresAtArea(pos, 1)[0]
    if (nearTarget) {
      if ((nearTarget.structure as OwnedStructure).owner) this.mass = true
      else this.target = nearTarget.structure
    } else {
      const closeTarget = this.structuresAtArea(pos, 3)[0]
      this.target = closeTarget && closeTarget.structure
    }
  }

  apply(creep: Creep) {
    if (this.target) creep.rangedAttack(this.target)
    else if (this.mass) creep.rangedMassAttack()
    return !!(this.target || this.mass)
  }

  // todo omit storages containers etc
  private structuresAtArea(pos: RoomPosition, range: number) {
    return pos
      .lookForAtInRange(LOOK_STRUCTURES, range)
      .filter(({ structure }) => structure.hits)
  }
}
