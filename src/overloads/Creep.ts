import _ from 'lodash'
import defineGetter from 'utils/defineGetter'
import ResourceRouteProcessor from 'job/resourceRoute/ResourceRouteProcessor'

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

defineCreepGetter('hasActiveAttackBodyPart', (self) => {
  return self.hasActiveBodyPart(ATTACK) || self.hasActiveBodyPart(RANGED_ATTACK)
})

defineCreepGetter('safeDistance', (self) => {
  if (self.hasActiveBodyPart(RANGED_ATTACK)) return 5
  else if (self.hasActiveBodyPart(ATTACK)) return 3
  return 1
})

const CREEP_BODY_HITS = 100
defineCreepGetter('_bodyPartHitThreshold', (self) => {
  const minUnreachableHits = MAX_CREEP_SIZE * CREEP_BODY_HITS + 1
  const bodypartMap: Record<BodyPartConstant, number> = {
    [MOVE]: minUnreachableHits,
    [WORK]: minUnreachableHits,
    [CARRY]: minUnreachableHits,
    [ATTACK]: minUnreachableHits,
    [RANGED_ATTACK]: minUnreachableHits,
    [TOUGH]: minUnreachableHits,
    [HEAL]: minUnreachableHits,
    [CLAIM]: minUnreachableHits,
  }
  self.body.reverse().forEach((bodyPart, i) => {
    bodypartMap[bodyPart.type] = Math.min(
      i * CREEP_BODY_HITS,
      bodypartMap[bodyPart.type],
    )
  })
  return bodypartMap as Record<BodyPartConstant, number>
})

defineCreepGetter('routeProcessor', (self) => {
  return (
    self.cache.routeProcessor ||
    (self.cache.routeProcessor = new ResourceRouteProcessor(self))
  )
})

Creep.prototype.hasActiveBodyPart = function (bodyPartType: BodyPartConstant) {
  const cachedThresholds =
    this.cache._bodypartHitThreshold ||
    (this.cache._bodypartHitThreshold = this._bodyPartHitThreshold)
  return this.hits > cachedThresholds[bodyPartType]
}

Creep.prototype.isSafeFrom = function (creep: Creep) {
  return this.pos.getRangeTo(creep) > creep.safeDistance
}

Creep.prototype.safeRangeXY = function (x: number, y: number) {
  return this.pos.rangeXY(x, y) - this.safeDistance
}
