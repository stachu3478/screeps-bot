import defineGetter from 'utils/defineGetter'
import { isWalkable } from './Structure'

function defineConstructionSiteGetter<T extends keyof ConstructionSite>(
  property: T,
  handler: (self: ConstructionSite) => ConstructionSite[T],
) {
  defineGetter<ConstructionSite, ConstructionSiteConstructor, T>(
    ConstructionSite,
    property,
    handler,
  )
}

defineConstructionSiteGetter('isWalkable', (self) => {
  return !self.my || isWalkable(self)
})
