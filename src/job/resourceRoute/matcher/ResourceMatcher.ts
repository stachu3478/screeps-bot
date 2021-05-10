export type ResourceSelector = (r: ResourceConstant) => boolean
type Withdrawable = Creep | AnyStoreStructure | Tombstone | Ruin
export default class ResourceMatcher {
  private rule: ResourceConstant | ResourceSelector

  constructor(rule: ResourceConstant | ResourceSelector) {
    this.rule = rule
  }

  findStored(withdrawable: Withdrawable, minAmount: number) {
    const rule = this.rule
    if (typeof rule === 'string')
      return this.storesResource(withdrawable, rule, minAmount) ? [rule] : []
    return Object.keys(withdrawable.store).filter((r) => {
      const resource = r as ResourceConstant
      if (!rule(resource)) return false
      return this.storesResource(withdrawable, resource, minAmount)
    }) as ResourceConstant[]
  }

  findCanBeFilled(
    withdrawable: Withdrawable,
    minFree: number = 0,
    maxFilled?: number,
  ) {
    const rule = this.rule
    if (typeof rule === 'string')
      return this.canBeFilledWithResource(
        withdrawable,
        rule,
        minFree,
        maxFilled,
      )
        ? [rule]
        : []
    return Object.keys(withdrawable.store).filter((r) => {
      const resource = r as ResourceConstant
      if (!rule(resource)) return false
      return this.canBeFilledWithResource(
        withdrawable,
        resource,
        minFree,
        maxFilled,
      )
    }) as ResourceConstant[]
  }

  private storesResource(
    w: Withdrawable,
    resource: ResourceConstant,
    minAmount: number,
  ) {
    return (w.store.getUsedCapacity(resource) || 0) > minAmount
  }

  private canBeFilledWithResource(
    w: Withdrawable,
    resource: ResourceConstant,
    minFree: number,
    maxFilled?: number,
  ) {
    const store = w.store as GenericStoreBase
    return (
      (store.getFreeCapacity(resource) || 0) >= minFree &&
      (store.getUsedCapacity(resource) || 0) <
        (maxFilled || store.getCapacity(resource) || 0)
    )
  }
}
