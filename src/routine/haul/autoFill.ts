import {
  SUCCESS,
  NOTHING_TODO,
  DONE,
  NO_RESOURCE,
} from '../../constants/response'
import profiler from 'screeps-profiler'
import { findNearStructureToFillWithPriority } from 'utils/find'

export default profiler.registerFN(function autoFill(creep: Creep) {
  const target = findNearStructureToFillWithPriority(creep)
  if (!target || !target.structureType) return NOTHING_TODO
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let remaining = creep.store[RESOURCE_ENERGY]
  remaining -= (target.store as StoreBase<
    ResourceConstant,
    false
  >).getFreeCapacity(RESOURCE_ENERGY)
  if (target.structureType !== STRUCTURE_CONTAINER) {
    const container = creep.pos.building(STRUCTURE_CONTAINER)
    if (container && container.store[RESOURCE_ENERGY])
      creep.withdraw(container, RESOURCE_ENERGY)
  }
  if (remaining <= 0) return DONE
  return SUCCESS
}, 'autoFillRoutine')
