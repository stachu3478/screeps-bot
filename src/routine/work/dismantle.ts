import move from '../../utils/path/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from '../../constants/response'
import { findTargetStructure } from 'routine/military/shared'

interface DismantleCreep extends Creep {
  cache: DismantleCache
}

interface DismantleCache extends CreepCache {
  dismantle?: Id<Structure>
}

export default function dismantle(
  creep: DismantleCreep,
  targetStructure = creep.cache.dismantle &&
    Game.getObjectById(creep.cache.dismantle),
) {
  const cache = creep.cache
  let target = targetStructure
  if (!target || !target.hits) {
    const newTarget = findTargetStructure(creep)
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
      creep.corpus.count(WORK) * DISMANTLE_POWER * DISMANTLE_COST
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
