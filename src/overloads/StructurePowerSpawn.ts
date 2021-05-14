import defineGetter from 'utils/defineGetter'

function definePowerSpawnGetter<T extends keyof StructurePowerSpawn>(
  property: T,
  handler: (self: StructurePowerSpawn) => StructurePowerSpawn[T],
) {
  defineGetter<StructurePowerSpawn, StructurePowerSpawnConstructor, T>(
    StructurePowerSpawn,
    property,
    handler,
  )
}

definePowerSpawnGetter('cache', (self) => {
  const cache = global.Cache.powerSpawns
  return cache[self.room.name] || (cache[self.room.name] = {})
})
