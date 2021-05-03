interface ResourceRouteOptions {
  from: StructureConstant
  to: StructureConstant
  type: ResourceConstant
  minimalFreeCapacityToFill?: number
  //maximumFilledAmount?: number
  minimalStoreToDraw?: number
  dump?: boolean
  //drawMoreThanCanBeFilled?: boolean
}

export default class ResourceRoute {
  private options: ResourceRouteOptions

  constructor(options: ResourceRouteOptions) {
    this.options = options
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

  //get maximumFilledAmount() {
  //  return this.options.maximumFilledAmount || Infinity
  //}

  /*get drawMoreThanCanBeFilled() {
    return !!this.options.drawMoreThanCanBeFilled
  }*/
}
