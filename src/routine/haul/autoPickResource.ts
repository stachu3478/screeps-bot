import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../../constants/response'
import { posToChar } from '../../planner/pos'
import { findNearDroppedResource, findNearTombstone, findNearRuin } from 'utils/find';

interface AutoPickCreep extends Creep {
  cache: AutoPickCache
}

interface AutoPickCache extends CreepCache {
  pick_pos?: string
}

export default function autoPickResource(creep: AutoPickCreep, resourceType: ResourceConstant) {
  let remaining = creep.store.getFreeCapacity(resourceType)
  if (remaining === 0) return NOTHING_TODO
  const cache = creep.cache
  if (cache.pick_pos) {
    const pickPos = cache.pick_pos.charCodeAt(0)
    if (creep.pos.rangeXY(pickPos & 63, pickPos >> 6) < 2) return DONE
  }
  let result
  let ruin: Ruin | Tombstone | undefined
  let drop = findNearDroppedResource(creep.pos, resourceType)
  if (!drop) {
    ruin = findNearRuin(creep.pos, resourceType) || findNearTombstone(creep.pos, resourceType)
    if (!ruin) {
      cache.pick_pos = posToChar(creep.pos)
      return NOTHING_TODO
    } else {
      result = creep.withdraw(ruin, resourceType)
      remaining -= ruin.store[resourceType]
    }
  } else {
    result = creep.pickup(drop)
    remaining -= drop.amount
  }

  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}
