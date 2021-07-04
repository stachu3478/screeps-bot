import move from '../../utils/path/path'
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
  currentRoomOnly = false,
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
      const maxRooms = currentRoomOnly ? 1 : 16
      move.cheap(creep, target, true, 1, maxRooms)
    }
  } else if (result === ERR_NOT_ENOUGH_RESOURCES) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
