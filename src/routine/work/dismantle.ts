import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from '../../constants/response'
import { findClosestHostileHittableStructures } from 'utils/find';

interface DismantleCreep extends Creep {
  memory: DismantleMemory
}

interface DismantleMemory extends CreepMemory {
  _dismantle?: Id<Structure>
}

export default function dismantle(creep: DismantleCreep) {
  let target = creep.memory._dismantle && Game.getObjectById(creep.memory._dismantle)
  if (!target || !target.hits) {
    const newTarget = findClosestHostileHittableStructures(creep.pos)
    if (newTarget) {
      target = newTarget
      creep.memory._dismantle = newTarget.id
    } else {
      delete creep.memory._dismantle
      return NOTHING_TODO
    }
  }
  const result = creep.dismantle(target)
  if (result === 0) {
    const remaining = creep.store.getFreeCapacity() - creep.workpartCount * DISMANTLE_POWER * DISMANTLE_COST
    if (remaining <= 0) {
      delete creep.memory._dismantle
      return DONE
    }
    return SUCCESS
  } else if (result === ERR_NOT_IN_RANGE) {
    move.cheap(creep, target)
    return NOTHING_DONE
  } else if (result === ERR_NO_BODYPART) {
    delete creep.memory._dismantle
    return FAILED
  }
  return NOTHING_DONE
}
