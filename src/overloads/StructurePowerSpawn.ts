import defineGetter from "utils/defineGetter";

function definePowerSpawnGetter<T>(property: string, handler: (self: StructurePowerSpawn) => T) {
  defineGetter<StructurePowerSpawn, StructurePowerSpawnConstructor, T>(StructurePowerSpawn, property, handler)
}

definePowerSpawnGetter('cache', self => {
  const cache = global.Cache.powerSpawns
  return cache[self.room.name] || (cache[self.room.name] = {})
})
