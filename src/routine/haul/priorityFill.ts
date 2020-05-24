import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'
import { findClosestStructureToFillWithPriority } from 'utils/find';

interface PriorityFillCreep extends Creep {
  memory: PriorityFillMemory
}

interface PriorityFillMemory extends CreepMemory {
  _fill?: Id<AnyStoreStructure>
}

export default function priorityFill(creep: PriorityFillCreep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  if (creep.room.memory.priorityFilled) return NOTHING_TODO
  let target = creep.memory._fill && Game.getObjectById(creep.memory._fill)
  if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    const newTarget = findClosestStructureToFillWithPriority(creep.room, creep.pos)
    if (!newTarget) {
      creep.room.memory.priorityFilled = 1
      return NOTHING_TODO
    }
    target = newTarget
    creep.memory._fill = target.id
  }
  const result = creep.transfer(target, RESOURCE_ENERGY)
  const remaining = creep.store[RESOURCE_ENERGY] - target.store.getFreeCapacity(RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    else {
      const newTarget = findClosestStructureToFillWithPriority(creep.room, creep.pos)
      if (!newTarget) return NOTHING_TODO
      target = newTarget
      creep.memory._fill = target.id
      if (!creep.pos.isNearTo(target)) cheapMove(creep, target)
    }
    return SUCCESS
  }
  return NOTHING_DONE
}