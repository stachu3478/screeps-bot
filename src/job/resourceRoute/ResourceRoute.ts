import StructureMatcher from './matcher/structureMatcher'
import { StoreStructureSelector } from '../selector/StoreStructureSelector'

interface ResourceRouteOptions {
  /**
   * Specifies all sources that the resource will be taken from
   */
  from: AnyStoreStructure['structureType'] | StoreStructureSelector
  /**
   * Specifies all targets that the resource will be trasfered to
   */
  to: AnyStoreStructure['structureType'] | StoreStructureSelector
  /**
   * Type of the resource
   * NOTE: Resource returned by function should not change while processing route
   */
  type: ResourceConstant | ((room: Room) => ResourceConstant | undefined) // | ResourceSelector
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
  /**
   * Conditional function to select source
   */
  if?: (s: AnyStoreStructure) => boolean
  /**
   * Function when is called when route has no job to process
   */
  done?: (room: Room) => void
}

const truthier = () => true
export default class ResourceRoute {
  private options: ResourceRouteOptions

  constructor(options: ResourceRouteOptions) {
    this.options = options
  }

  get done() {
    return this.options.done
  }

  get maximumFilledAmount() {
    return this.options.maximumFilledAmount
  }

  get type() {
    return this.options.type
  }

  get minimalFreeCapacityToFill() {
    return this.options.minimalFreeCapacityToFill || 50
  }

  get minimalStoreToDraw() {
    return Math.max(
      this.options.minimalStoreToDraw || 50,
      this.options.keep || 0,
    )
  }

  get dump() {
    return !!this.options.dump
  }

  get if() {
    return this.options.if || truthier
  }

  get keepAmount() {
    return this.options.keep || 0
  }

  get from() {
    return this.options.from
  }

  get to() {
    return this.options.to
  }
}
