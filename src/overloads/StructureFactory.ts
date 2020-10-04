import defineGetter from 'utils/defineGetter'

function defineFactoryGetter<T>(
  property: string,
  handler: (self: StructureFactory) => T,
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
