import link from 'config/link'
import defineGetter from 'utils/defineGetter'
import { memoizeBy } from './memoize'

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

const linkIsFor = (mode: string) => (self: _HasId) => {
  return link.some((r) => {
    const room = Game.structures[self.id].room
    return (
      r.links(room).some((l) => l.id === self.id) &&
      (r.mode === 'both' || r.mode === mode)
    )
  })
}
const linkIsDrain = memoizeBy(linkIsFor('drain'))
defineLinkGetter('isDrain', (self) => linkIsDrain(self))
const linkIsCollector = memoizeBy(linkIsFor('collector'))
defineLinkGetter('isCollector', (self) => linkIsCollector(self))

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
