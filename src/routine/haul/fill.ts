import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'

export interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
}

export default function fill(
  creep: FillCreep,
  target: AnyStoreStructure | null | undefined = creep.memory._fill &&
    Game.getObjectById(creep.memory._fill),
  resourceType: ResourceConstant = creep.memory._fillType || RESOURCE_ENERGY,
) {
  if (creep.store[resourceType] === 0) return DONE
  if (!target || !target.store.getFreeCapacity(resourceType))
    return NOTHING_TODO
  const result = creep.transfer(target, resourceType)
  if (result === ERR_NOT_IN_RANGE) {
    const result = move.cheap(creep, target, true)
    if (result === ERR_NO_PATH) {
      move.anywhere(creep, creep.pos.getDirectionTo(target))
      return 0
    }
  } else if (result !== 0) return FAILED
  else {
    delete creep.memory._fill
    delete creep.memory._fillType
    return SUCCESS
  }
  return NOTHING_DONE
}
