import FactoryRouter from 'job/factoryRoute/FactoryRouter'
import _ from 'lodash'
import defineGetter from 'utils/defineGetter'

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

function memoizeByFactory<T>(fn: (f: StructureFactory) => T) {
  return _.memoize(fn, (f: StructureFactory) => f.id)
}

defineFactoryGetter('cache', (self) => {
  const cache = global.Cache.factories
  return cache[self.room.name] || (cache[self.room.name] = {})
})

const factoryRouter = memoizeByFactory((f) => new FactoryRouter(f))
defineFactoryGetter('router', (self) => factoryRouter(self))
