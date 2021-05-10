import StructureMatcher from './matcher/structureMatcher'
import ResourceMatcher from './matcher/ResourceMatcher'
import { StoreStructureSelector } from '../selector/StoreStructureSelector'

type ResourceSelector = (r: ResourceConstant) => boolean

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
   */
  type: ResourceConstant | ResourceSelector
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
  private resourceMatcher: ResourceMatcher

  constructor(options: ResourceRouteOptions) {
    this.options = options
    this.resourceMatcher = new ResourceMatcher(this.options.type)
  }

  /**
   * Validates previously selected source
   */
  validateSource(s: AnyStoreStructure) {
    const minAmount = Math.max(this.minimalStoreToDraw, this.options.keep || 0)
    return !!this.resourceMatcher.findStored(s, minAmount).length
  }

  /**
   * Validates previously selected target
   */
  validateTarget(s: AnyStoreStructure) {
    const minFree = this.minimalFreeCapacityToFill
    const maxFilled = this.options.maximumFilledAmount
    return !!this.resourceMatcher.findCanBeFilled(s, minFree, maxFilled).length
  }

  drawAmount(source: AnyStoreStructure, resource: ResourceConstant) {
    if (!this.options.keep) return source.store[resource] || 0
    const amount = (source.store[resource] || 0) - this.options.keep
    return amount
  }

  fillAmount(target: AnyStoreStructure, resource: ResourceConstant) {
    if (!this.options.maximumFilledAmount)
      return target.store.getFreeCapacity(resource) || 0
    console.log(this.options.maximumFilledAmount)
    const amount =
      this.options.maximumFilledAmount - (target.store[resource] || 0)
    return amount
  }

  findStoredResource(withdrawable: Creep | AnyStoreStructure) {
    const matcher = this.options.type
    if (typeof matcher === 'string') {
      return withdrawable.store[matcher] > 0 ? matcher : undefined
    } else {
      return Object.keys(withdrawable.store).find((r) => {
        const resource = r as ResourceConstant
        return matcher(resource)
      }) as ResourceConstant | undefined
    }
  }

  findValidResource(withdrawable: AnyStoreStructure) {
    const minAmount = Math.max(this.minimalStoreToDraw, this.options.keep || 0)
    return this.resourceMatcher.findStored(withdrawable, minAmount)
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

  get minStored() {
    return Math.max(this.minimalStoreToDraw, this.options.keep || 0)
  }

  get maximumFilledAmount() {
    return this.options.maximumFilledAmount
  }

  get from() {
    return new StructureMatcher(this.options.from)
  }

  get to() {
    return new StructureMatcher(this.options.to)
  }

  get resource() {
    return this.resourceMatcher
  }

  /*get drawMoreThanCanBeFilled() {
    return !!this.options.drawMoreThanCanBeFilled
  }*/
}
