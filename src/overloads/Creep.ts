Object.defineProperty(Creep.prototype, 'motherRoom', {
  get: function () {
    const self: Creep = this as Creep
    return Game.rooms[self.memory.room] || self.room
  }
})

Object.defineProperty(Creep.prototype, 'workpartCount', {
  get: function () {
    const self: Creep = this as Creep
    return self.memory[Keys.workpartCount] || (self.memory[Keys.workpartCount] = self.getActiveBodyparts(WORK))
  }
})
