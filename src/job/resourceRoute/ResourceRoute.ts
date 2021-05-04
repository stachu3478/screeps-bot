type StructureSelector = (r: Room) => AnyStoreStructure[]
interface ResourceRouteOptions {
  from: StructureConstant
  to: AnyStoreStructure['structureType'] | StructureSelector
  type: ResourceConstant
  minimalFreeCapacityToFill?: number
  maximumFilledAmount?: number
  minimalStoreToDraw?: number
  dump?: boolean
  //drawMoreThanCanBeFilled?: boolean
}

export default class ResourceRoute {
  private options: ResourceRouteOptions

  constructor(options: ResourceRouteOptions) {
    this.options = options
  }

  findTargets(room: Room, differ?: Structure) {
    const matcher = this.options.to
    let match: AnyStoreStructure[]
    if (typeof matcher === 'function') {
      match = matcher(room)
    } else {
      match = room
        .find(FIND_STRUCTURES)
        .filter((s) => s.structureType === matcher) as AnyStoreStructure[]
    }
    return match.filter((s) => s !== differ && this.validateTarget(s))
  }

  /**
   * Validates previously selected source
   */
  validateSource(s: AnyStoreStructure | Tombstone | Ruin) {
    return (s.store[this.type] || 0) >= this.minimalStoreToDraw
  }

  /**
   * Validates previously selected target
   */
  validateTarget(s: AnyStoreStructure) {
    return (
      (s.store.getFreeCapacity(this.type) || 0) >=
        this.minimalFreeCapacityToFill && this.fillAmount(s) > 0
    )
  }

  fillAmount(target: AnyStoreStructure) {
    if (!this.options.maximumFilledAmount)
      return target.store.getFreeCapacity(this.type) || 0
    const amount =
      this.options.maximumFilledAmount - (target.store[this.type] || 0)
    return amount
  }

  get from() {
    return this.options.from
  }

  get type() {
    return this.options.type
  }

  get minimalFreeCapacityToFill() {
    return this.options.minimalFreeCapacityToFill || 50
  }

  get minimalStoreToDraw() {
    return this.options.minimalStoreToDraw || 50
  }

  get dump() {
    return !!this.options.dump
  }

  /*get drawMoreThanCanBeFilled() {
    return !!this.options.drawMoreThanCanBeFilled
  }*/
}
