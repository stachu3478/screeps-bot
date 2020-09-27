import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from '../../constants/response'
import { findClosestHostileHittableStructures } from 'utils/find'

interface DismantleCreep extends Creep {
  cache: DismantleCache
}

interface DismantleCache extends CreepCache {
  dismantle?: Id<Structure>
}

export default function dismantle(creep: DismantleCreep) {
  const cache = creep.cache
  let target = cache.dismantle && Game.getObjectById(cache.dismantle)
  if (!target || !target.hits) {
    const newTarget = findClosestHostileHittableStructures(creep.pos)
    if (newTarget) {
      target = newTarget
      cache.dismantle = newTarget.id
    } else {
      delete cache.dismantle
      return NOTHING_TODO
    }
  }
  const result = creep.dismantle(target)
  if (result === 0) {
    const remaining =
      creep.store.getFreeCapacity() -
      creep.workpartCount * DISMANTLE_POWER * DISMANTLE_COST
    if (remaining <= 0) {
      delete cache.dismantle
      return DONE
    }
    return SUCCESS
  } else if (result === ERR_NOT_IN_RANGE) {
    move.cheap(creep, target)
    return NOTHING_DONE
  } else if (result === ERR_NO_BODYPART) {
    delete cache.dismantle
    return FAILED
  }
  return NOTHING_DONE
}
