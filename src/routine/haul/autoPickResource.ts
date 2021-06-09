import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../../constants/response'
import {
  findNearDroppedResource,
  findNearTombstone,
  findNearRuin,
} from 'utils/find'

interface AutoPickCreep extends Creep {
  cache: AutoPickCache
}

interface AutoPickCache extends CreepCache {
  pickPos?: RoomPosition
}

export default function autoPickResource(
  creep: AutoPickCreep,
  resourceType: ResourceConstant,
) {
  let remaining = creep.store.getFreeCapacity(resourceType)
  if (remaining === 0) return NOTHING_TODO
  const cache = creep.cache
  if (cache.pickPos) {
    const pickPos = cache.pickPos
    if (creep.pos.range(pickPos) < 2) return DONE
  }
  let result
  let ruin: Ruin | Tombstone | undefined
  let drop = findNearDroppedResource(creep.pos, resourceType)
  if (!drop) {
    ruin =
      findNearRuin(creep.pos, resourceType) ||
      findNearTombstone(creep.pos, resourceType)
    if (!ruin) {
      cache.pickPos = creep.pos
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
