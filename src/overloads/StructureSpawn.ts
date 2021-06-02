import sanitizeBody from 'utils/sanitizeBody'
import { uniqName } from 'spawn/name'
import defineGetter from 'utils/defineGetter'
import { ALL_DIRECTIONS } from 'constants/support'

function defineSpawnGetter<T extends keyof StructureSpawn>(
  property: T,
  handler: (self: StructureSpawn) => StructureSpawn[T],
) {
  defineGetter<StructureSpawn, StructureSpawnConstructor, T>(
    StructureSpawn,
    property,
    handler,
  )
}

defineSpawnGetter('cache', (self) => {
  const cache = global.Cache.spawns
  return cache[self.id] || (cache[self.id] = {})
})

defineSpawnGetter('distanceToController', (self) => {
  const cache = self.cache
  return (
    cache.distanceToController ||
    (cache.distanceToController = self.pos.findPathTo(
      self.room.controller!,
    ).length)
  )
})

StructureSpawn.prototype.getDirections = function () {
  const directions = ALL_DIRECTIONS.filter((d) => {
    const offset = this.pos.offset(d)
    return offset.building(STRUCTURE_ROAD)
  })
  if (directions.length > 0) return directions
  return ALL_DIRECTIONS
}

StructureSpawn.prototype.trySpawnCreep = function (
  body: BodyPartConstant[],
  letter: string,
  memory: CreepMemory,
  retry: boolean = false,
  cooldown: number = 100,
  boost: BoostInfo[] = [],
) {
  const name = uniqName(letter)
  const result = this.spawnCreep(body, name, { memory, dryRun: true })
  if (result !== 0) {
    if (result !== ERR_NOT_ENOUGH_ENERGY)
      throw new Error('Uncaught spawning error! ' + result)
    if (!retry)
      this.cache.trySpawn = {
        creep: body,
        name,
        memory,
        cooldown,
        boost,
      }
  } else {
    const motherMemory = Memory.rooms[memory.room]
    const cache = this.cache
    if (!motherMemory.creeps) motherMemory.creeps = {}
    this.spawnCreep(sanitizeBody(body), name, {
      memory,
      directions: this.getDirections() /*energyStructures: getDistanceOrderedHatches(this.room, creepCost(body))*/,
    })
    motherMemory.creeps[name] = 0
    boost.forEach((data) => {
      this.room.boosts.createRequest(name, data.resource, data.partCount)
    })
    delete cache.sourceId
    delete cache.trySpawn
  }
  this.room.visual.info('Try to spawn ' + name, 0, 3)
  return result
}
