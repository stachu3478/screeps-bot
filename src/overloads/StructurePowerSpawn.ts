import defineGetter from 'utils/defineGetter'
import { cache } from './cache'

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

definePowerSpawnGetter('cache', (self) => cache(self))
