import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
} from '../../constants/response'

interface BuildCreep extends Creep {
  cache: BuildCache
}

interface BuildCache extends CreepCache {
  build?: Id<ConstructionSite>
}

export default function build(creep: BuildCreep) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  const cache = creep.cache
  if (storedEnergy === 0) return NO_RESOURCE
  let target = cache.build && Game.getObjectById(cache.build)
  if (!target) {
    target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
    if (!target) return NOTHING_TODO
    cache.build = target.id
  }
  const result = creep.build(target)
  const remaining = storedEnergy - creep.workpartCount * BUILD_POWER
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target, false, 3)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
