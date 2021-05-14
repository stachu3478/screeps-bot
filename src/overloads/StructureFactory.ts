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

defineFactoryGetter('cache', (self) => {
  const cache = global.Cache.factories
  return cache[self.room.name] || (cache[self.room.name] = {})
})
