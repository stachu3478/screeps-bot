import StructureMatcher from './matcher/structureMatcher'
import ResourceRoute from './ResourceRoute'

export default class RoomResourceRoute {
  private room: Room
  private route: ResourceRoute
  private sourceMatcher: StructureMatcher
  private targetMatcher: StructureMatcher

  constructor(room: Room, route: ResourceRoute) {
    this.room = room
    this.route = route
    this.sourceMatcher = new StructureMatcher(this.route.from)
    this.targetMatcher = new StructureMatcher(this.route.to)
  }

  findSources(differ?: Structure) {
    if (!this.type) {
      return []
    }
    const match = this.sourceMatcher.call(this.room) as AnyStoreStructure[]
    return match.filter(
      (s) => s !== differ && this.route.if(s) && this.validateSource(s),
    )
  }

  findTargets(differ?: Structure) {
    if (!this.type) {
      return []
    }
    const match = this.targetMatcher.call(this.room) as AnyStoreStructure[]
    return match.filter((s) => s !== differ && this.validateTarget(s))
  }

  /**
   * Validates previously selected source
   */
  validateSource(s: AnyStoreStructure | Tombstone | Ruin) {
    if (!this.type) {
      return false
    }
    const stored = s.store[this.type] || 0
    return stored >= this.route.minimalStoreToDraw
  }

  /**
   * Validates previously selected target
   */
  validateTarget(s: AnyStoreStructure) {
    return (
      (s.store.getFreeCapacity(this.type) || 0) >=
        this.route.minimalFreeCapacityToFill && this.fillAmount(s) > 0
    )
  }

  drawAmount(source: AnyStoreStructure) {
    if (!this.type) {
      return 0
    }
    const stored = source.store[this.type] || 0
    const keepAmount = this.route.keepAmount
    const amount = stored - keepAmount
    return amount
  }

  fillAmount(target: AnyStoreStructure) {
    if (!this.type) {
      return 0
    }
    let amount = target.store.getFreeCapacity(this.type) || 0
    if (this.route.maximumFilledAmount)
      amount = Math.min(
        amount,
        this.route.maximumFilledAmount - (target.store[this.type] || 0),
      )
    return amount
  }

  done() {
    if (this.route.done) {
      this.route.done(this.room)
    }
  }

  get permittedType() {
    const type = this.type
    if (!type) {
      throw new Error('Missing resource route type')
    }
    return type
  }

  get type() {
    const type = this.route.type
    if (typeof type === 'function') {
      return type(this.room)
    }
    return type
  }

  get dump() {
    return this.route.dump
  }
}
