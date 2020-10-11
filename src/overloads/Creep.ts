import defineGetter from 'utils/defineGetter'

function defineCreepGetter<T>(property: string, handler: (self: Creep) => T) {
  defineGetter<Creep, CreepConstructor, T>(Creep, property, handler)
}

defineCreepGetter('cache', (self) => {
  const cache = global.Cache.creeps
  return cache[self.name] || (cache[self.name] = {})
})

defineCreepGetter('motherRoom', (self) => {
  return Game.rooms[self.memory.room] || self.room
})

defineCreepGetter('workpartCount', (self) => {
  const cache = self.cache
  return (
    cache.workpartCount || (cache.workpartCount = self.getActiveBodyparts(WORK))
  )
})

defineCreepGetter('isRetired', (self) => {
  return (
    (self.ticksToLive || CREEP_LIFE_TIME) <=
    self.body.length * CREEP_SPAWN_TIME + self.memory.deprivity
  )
})
