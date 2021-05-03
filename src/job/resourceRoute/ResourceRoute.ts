interface ResourceRouteOptions {
  from: StructureConstant
  to: StructureConstant
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

  validateSource(s: AnyStoreStructure | Tombstone | Ruin) {
    return (s.store[this.type] || 0) >= this.minimalStoreToDraw
  }

  validateTarget(s: AnyStoreStructure) {
    return (
      (s.store.getFreeCapacity(this.type) || 0) >=
        this.minimalFreeCapacityToFill &&
      s.store[this.type] < this.fillAmount(s)
    )
  }

  fillAmount(target: AnyStoreStructure) {
    if (!this.options.maximumFilledAmount)
      return target.store.getFreeCapacity(this.options.type) || 0
    const amount =
      this.options.maximumFilledAmount - (target.store[this.options.type] || 0)
    return amount
  }

  get from() {
    return this.options.from
  }

  get to() {
    return this.options.to
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
