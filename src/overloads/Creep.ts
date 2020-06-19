Object.defineProperty(Creep.prototype, 'motherRoom', {
  get: function () {
    const self: Creep = this as Creep
    return Game.rooms[self.memory.room] || self.room
  }
})