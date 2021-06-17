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
  const withdrawAmount = Math.min(
    amount || Infinity,
    creep.store.getFreeCapacity(resourceType),
    target.store[resourceType],
  )
  const result = creep.withdraw(target, resourceType, withdrawAmount)
  if (result === ERR_NOT_IN_RANGE) {
    if (creep.room.name !== target.pos.roomName) {
      creep.moveToRoom(target.pos.roomName)
    } else {
      move.cheap(creep, target)
    }
  } else if (result === ERR_NOT_ENOUGH_RESOURCES) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
