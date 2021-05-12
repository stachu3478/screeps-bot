import defineGetter from 'utils/defineGetter'
import ResourceRouteProcessor from 'job/resourceRoute/ResourceRouteProcessor'
import BuildingRouteProcessor from 'job/buildingRoute/BuildingRouteProcessor'
import RepairRouteProcessor from 'job/repairRoute/RepairRouteProcessor'
import move from 'utils/path'
import CreepCorpus from './CreepCorpus'

function defineCreepGetter<T>(property: string, handler: (self: Creep) => T) {
  defineGetter<Creep, CreepConstructor, T>(Creep, property, handler)
}

defineCreepGetter('cache', (self) => {
  const cache = global.Cache.creeps
  const key = self.my ? self.name : self.owner.username + self.name
  return cache[key] || (cache[key] = {})
})

defineCreepGetter('motherRoom', (self) => {
  return Game.rooms[self.memory.room] || self.room
})

defineCreepGetter('isRetired', (self) => {
  return (
    (self.ticksToLive || CREEP_LIFE_TIME) <=
    self.body.length * CREEP_SPAWN_TIME + self.memory.deprivity
  )
})

defineCreepGetter('routeProcessor', (self) => {
  return (
    self.cache.routeProcessor ||
    (self.cache.routeProcessor = new ResourceRouteProcessor(self))
  )
})

defineCreepGetter('buildingRouteProcessor', (self) => {
  return (
    self.cache.buildingRouteProcessor ||
    (self.cache.buildingRouteProcessor = new BuildingRouteProcessor(self))
  )
})

defineCreepGetter('repairRouteProcessor', (self) => {
  return (
    self.cache.repairRouteProcessor ||
    (self.cache.repairRouteProcessor = new RepairRouteProcessor(self))
  )
})

defineCreepGetter('corpus', (self) => {
  return self.cache.corpus || (self.cache.corpus = new CreepCorpus(self))
})

Creep.prototype.isSafeFrom = function (creep: Creep) {
  return this.pos.getRangeTo(creep) > creep.corpus.safeDistance
}

Creep.prototype.safeRangeXY = function (x: number, y: number) {
  return this.pos.rangeXY(x, y) - this.corpus.safeDistance
}

Creep.prototype.moveToRoom = function (room: string) {
  let target = this.memory[Keys.roomPath]
  if (!target || target[0] !== this.room.name || target[1] !== room) {
    const pathStep = this.room.location.findRoomPathStep(this.room.name, room)
    if (!pathStep) return ERR_NOT_FOUND
    target = this.memory[Keys.roomPath] = [this.room.name, room, pathStep]
  }
  const roomPathStep = target[2]
  const pos = new RoomPosition(
    roomPathStep.x,
    roomPathStep.y,
    roomPathStep.name,
  )
  return move.cheap(this, pos, true)
}