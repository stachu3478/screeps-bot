import link from 'config/link'
import defineGetter from 'utils/defineGetter'

function defineLinkGetter<T extends keyof StructureLink>(
  property: T,
  handler: (self: StructureLink) => StructureLink[T],
) {
  defineGetter<StructureLink, StructureLinkConstructor, T>(
    StructureLink,
    property,
    handler,
  )
}

defineLinkGetter('cache', (self) => {
  const cache = global.Cache.links
  if (cache[self.id]) return cache[self.id]
  const newCache = {
    isCollector: false,
    isDrain: false,
  }
  link.find((r) => {
    const links = r.links(self.room)
    const found = links.find((l) => l.id === self.id)
    if (!found) return
    if (r.mode === 'both') {
      newCache.isCollector = true
      newCache.isDrain = true
      return true
    }
    if (r.mode === 'drain') newCache.isDrain = true
    if (r.mode === 'collect') newCache.isCollector = true
    return false
  })
  return (cache[self.id] = newCache)
})

StructureLink.prototype.onTransfer = function (amount: number) {
  const stored = this.store[RESOURCE_ENERGY] + amount
  if (stored === LINK_CAPACITY) {
    link.find((r) => {
      if (r.mode === 'drain') return
      const links = r.links(this.room)
      const found = links.find(
        (l) =>
          l.store.getFreeCapacity(RESOURCE_ENERGY) >= r.minFreeCapacityToFill!,
      )
      if (found) this.transferEnergy(found)
      return !!found
    })
  }
}

StructureLink.prototype.onWithdraw = function (amount: number) {
  const stored = this.store[RESOURCE_ENERGY] + amount
  if (stored === 0) {
    link.find((r) => {
      if (r.mode === 'collect') return
      const links = r.links(this.room)
      const found = links.find(
        (l) =>
          !l.cooldown && l.store[RESOURCE_ENERGY] >= r.minStoredToTransfer!,
      )
      if (found) found.transferEnergy(this)
      return !!found
    })
  }
}
