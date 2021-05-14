import defineGetter from 'utils/defineGetter'

function definePowerSpawnGetter<T extends keyof StructureNuker>(
  property: T,
  handler: (self: StructureNuker) => StructureNuker[T],
) {
  defineGetter<StructureNuker, StructureNukerConstructor, T>(
    StructureNuker,
    property,
    handler,
  )
}

definePowerSpawnGetter('readyToLaunch', (self) => {
  if (self.store.getFreeCapacity(RESOURCE_ENERGY)) return false
  if (self.store.getFreeCapacity(RESOURCE_GHODIUM)) return false
  if (self.cooldown) return false
  return self.isActive()
})
