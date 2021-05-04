type WithdrawableStructureSelector = (
  r: Room,
) => (AnyStoreStructure | Tombstone | Ruin)[]
type StructureSelector = (r: Room) => AnyStoreStructure[]
interface ResourceRouteOptions {
  /**
   * Specifies all sources that the resource will be taken from
   */
  from: StructureConstant | WithdrawableStructureSelector
  /**
   * Specifies all targets that the resource will be trasfered to
   */
  to: AnyStoreStructure['structureType'] | StructureSelector
  /**
   * Type of the resource
   */
  type: ResourceConstant
  /**
   * Conditional minimum available space in target to be filled
   */
  minimalFreeCapacityToFill?: number
  /**
   * Conditional maximum amount in targets that have to be filled with
   */
  maximumFilledAmount?: number
  /**
   * Conditional minimal amount in sources to take from
   * NOTE: More of the recourse can be taken
   */
  minimalStoreToDraw?: number
  /**
   * Ensures creep to transfer all his excess carry to storage
   */
  dump?: boolean
  /**
   * Amount to keep in sources
   */
  keep?: number
}

export default class ResourceRoute {
  private options: ResourceRouteOptions

  constructor(options: ResourceRouteOptions) {
    this.options = options
  }

  findSources(room: Room, differ?: Structure) {
    const matcher = this.options.from
    let match: (AnyStoreStructure | Tombstone | Ruin)[]
    if (typeof matcher === 'function') {
      match = matcher(room)
    } else {
      match = room
        .find(FIND_STRUCTURES)
        .filter((s) => s.structureType === matcher) as AnyStoreStructure[]
    }
    return match.filter((s) => s !== differ && this.validateSource(s))
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
    const stored = s.store[this.type] || 0
    return (
      stored >= this.minimalStoreToDraw && stored >= (this.options.keep || 0)
    )
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

  drawAmount(source: AnyStoreStructure) {
    if (!this.options.keep) return source.store[this.type] || 0
    const amount = (source.store[this.type] || 0) - this.options.keep
    return amount
  }

  fillAmount(target: AnyStoreStructure) {
    if (!this.options.maximumFilledAmount)
      return target.store.getFreeCapacity(this.type) || 0
    const amount =
      this.options.maximumFilledAmount - (target.store[this.type] || 0)
    return amount
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
