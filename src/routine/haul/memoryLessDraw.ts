import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'

export default function memoryLessDraw(
  creep: Creep,
  target: AnyStoreStructure | Tombstone | Ruin,
  resourceType: ResourceConstant,
  amount?: number,
) {
  if (creep.store.getFreeCapacity(resourceType) === 0) return DONE
  if (target.store[resourceType] === 0) return NOTHING_TODO
  const result = creep.withdraw(
    target,
    resourceType,
    Math.min(
      amount || Infinity,
      creep.store.getFreeCapacity(resourceType),
      target.store[resourceType],
    ),
  )
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target)
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
