import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
} from 'constants/response'

interface ToRepair {
  [key: string]: number
}
const toRepair: ToRepair = {
  [STRUCTURE_SPAWN]: 1,
  [STRUCTURE_EXTENSION]: 1,
  [STRUCTURE_TOWER]: 1,
  [STRUCTURE_STORAGE]: 1,
  [STRUCTURE_TERMINAL]: 1,
}

interface RepairCreep extends Creep {
  cache: RepairCache
}

interface RepairCache extends CreepCache {
  repair?: Id<Structure>
}

export default function repair(creep: RepairCreep) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  const motherRoom = creep.motherRoom
  const roomCache = motherRoom.cache
  const cache = creep.cache
  if (roomCache.repaired) return NOTHING_TODO
  let target = cache.repair && Game.getObjectById(cache.repair)
  const repairPower = creep.corpus.count(WORK) * REPAIR_POWER
  if (!target || target.hits === target.hitsMax) {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        toRepair[s.structureType] && s.hits + repairPower <= s.hitsMax,
    })
    if (!target) {
      roomCache.repaired = 1
      return NOTHING_TODO
    }
    cache.repair = target.id
  }
  const result = creep.repair(target)
  const remaining = storedEnergy - creep.corpus.count(WORK)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target, false, 3)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
