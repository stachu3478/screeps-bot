import defineGetter from 'utils/defineGetter';

function defineCreepGetter<T>(property: string, handler: (self: Creep) => T) {
  defineGetter<Creep, CreepConstructor, T>(Creep, property, handler)
}

defineCreepGetter('motherRoom', self => {
  return Game.rooms[self.memory.room] || self.room
})

defineCreepGetter('workpartCount', self => {
  return self.memory[Keys.workpartCount] || (self.memory[Keys.workpartCount] = self.getActiveBodyparts(WORK))
})
