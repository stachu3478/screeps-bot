import {
  SUCCESS,
  NOTHING_TODO,
  FAILED,
  NO_RESOURCE,
} from '../../constants/response'
import { findCloseMostDamagedStructure } from 'utils/find'

interface AutoRepairCreep extends Creep {
  cache: AutoRepairCache
}

interface AutoRepairCache extends CreepCache {
  repair_cooldown?: number
  auto_repair?: Id<Structure>
}

export default function autoRepair(
  creep: AutoRepairCreep,
  timeout: number = 6,
) {
  const cache = creep.cache
  if ((cache.repair_cooldown || 0) > 0) {
    cache.repair_cooldown = (cache.repair_cooldown || 0) - 1
    return NOTHING_TODO
  }
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  let target = cache.auto_repair && Game.getObjectById(cache.auto_repair)
  if (
    !target ||
    target.hits === target.hitsMax ||
    creep.pos.rangeTo(target) > 3
  ) {
    const repairPower = creep.workpartCount * REPAIR_POWER
    target = findCloseMostDamagedStructure(creep.pos, repairPower)
    if (!target) {
      cache.repair_cooldown = timeout
      return NOTHING_TODO
    }
    cache.auto_repair = target.id
  }
  const result = creep.repair(target)
  const remaining = storedEnergy - creep.workpartCount
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) {
      delete cache.auto_repair
      return NO_RESOURCE
    }
    return SUCCESS
  }
}
