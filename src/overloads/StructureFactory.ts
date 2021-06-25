import FactoryRouter from 'job/factoryRoute/FactoryRouter'
import _ from 'lodash'
import defineGetter from 'utils/defineGetter'
import { cache } from './cache'
import { memoizeBy } from './memoize'

function defineFactoryGetter<T extends keyof StructureFactory>(
  property: T,
  handler: (self: StructureFactory) => StructureFactory[T],
) {
  defineGetter<StructureFactory, StructureFactoryConstructor, T>(
    StructureFactory,
    property,
    handler,
  )
}

defineFactoryGetter('cache', (self) => cache(self))

const factoryRouter = memoizeBy<FactoryRouter, StructureFactory>(
  (f) => new FactoryRouter(f),
)
defineFactoryGetter('router', (self) => factoryRouter(self))
defineFactoryGetter('needs', (self) => self.cache.needs)
defineFactoryGetter('dumps', (self) => self.cache.dumps)

StructureFactory.prototype.reloadNeeds = function () {
  if (!this.cache.needs) {
    this.cache.needs = this.router.findNeededRecipeComponent()
  }
}

StructureFactory.prototype.reloadDumps = function () {
  if (!this.cache.dumps) {
    this.cache.dumps = this.router.findNotNeededRecipeComponent()
  }
}
