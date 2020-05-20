import { SUCCESS, NOTHING_TODO, FAILED, DONE, NO_RESOURCE } from '../../constants/response'
import profiler from "screeps-profiler"
import { findNearStructureToFillWithPriority } from 'utils/find';

interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default profiler.registerFN(function autoFill(creep: FillCreep) {
  let remaining = creep.store[RESOURCE_ENERGY]
  if (remaining === 0) return NO_RESOURCE
  const target = findNearStructureToFillWithPriority(creep.room, creep.pos.x, creep.pos.y)
  if (!target || !target.structureType) return NOTHING_TODO
  const result = creep.transfer(target, RESOURCE_ENERGY)
  remaining -= (target.store as StoreBase<ResourceConstant, false>).getFreeCapacity(RESOURCE_ENERGY)
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'autoFillRoutine')
