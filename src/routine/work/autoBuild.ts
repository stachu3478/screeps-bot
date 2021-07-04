import { CREEP_RANGE } from 'constants/support'
import {
  SUCCESS,
  NOTHING_TODO,
  FAILED,
  NO_RESOURCE,
} from '../../constants/response'

interface AutoBuildCreep extends Creep {
  cache: AutoBuildCache
}

interface AutoBuildCache extends CreepCache {
  build?: Id<ConstructionSite>
}

export default function autoBuild(creep: AutoBuildCreep) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  const cache = creep.cache
  if (storedEnergy === 0) return NO_RESOURCE
  let target = cache.build && Game.getObjectById(cache.build)
  if (!target || target.pos.getRangeTo(creep) > CREEP_RANGE) {
    target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, CREEP_RANGE)[0]
    if (!target) return NOTHING_TODO
    cache.build = target.id
  }
  const result = creep.build(target)
  if (result !== 0) return FAILED
  else {
    const remaining = storedEnergy - creep.corpus.count(WORK) * BUILD_POWER
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
}
