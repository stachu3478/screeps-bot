import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, DONE } from 'constants/response'

export default function memoryLessFill(
  creep: Creep,
  target: AnyStoreStructure,
  resourceType: ResourceConstant,
  amount: number = 0,
) {
  const stored = creep.store[resourceType]
  if (stored === 0) return DONE
  if (!target.store.getFreeCapacity(resourceType)) return NOTHING_TODO
  const toBeTransfered = Math.min(amount, stored || 0)
  const result = creep.transfer(target, resourceType, toBeTransfered)
  if (result === ERR_NOT_IN_RANGE) {
    const result = move.cheap(creep, target)
    if (result === ERR_NO_PATH) {
      move.anywhere(creep, creep.pos.getDirectionTo(target))
      return 0
    }
  } else if (result !== 0) {
    if (result === ERR_FULL) {
      return NOTHING_TODO // idk?
    }
    throw new Error(`Invalid response: ${result}`)
    //return FAILED
  } else {
    if (toBeTransfered === stored) return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
