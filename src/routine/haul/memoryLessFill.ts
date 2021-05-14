import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'

export default function memoryLessFill(
  creep: Creep,
  target: AnyStoreStructure,
  resourceType: ResourceConstant,
  amount: number = 0,
) {
  if (creep.store[resourceType] === 0) return DONE
  if (!target.store.getFreeCapacity(resourceType)) return NOTHING_TODO
  const toBeTransfered = Math.min(amount, creep.store[resourceType] || 0)
  const result = creep.transfer(target, resourceType, toBeTransfered)
  if (result === ERR_NOT_IN_RANGE) {
    const result = move.cheap(creep, target)
    if (result === ERR_NO_PATH) {
      move.anywhere(creep, creep.pos.getDirectionTo(target))
      return 0
    }
  } else if (result !== 0) return FAILED
  else {
    if ((target.store.getFreeCapacity(resourceType) || 0) > toBeTransfered)
      return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
