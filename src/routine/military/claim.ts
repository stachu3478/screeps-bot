import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'
import MyRooms from 'room/MyRooms'

export default function claim(creep: Creep) {
  const target = creep.room.controller
  if (!target || target.my) return NOTHING_TODO
  let result
  if (target.attackable) {
    result = creep.attackController(target)
  } else if (creep.pos.isNearTo(target)) {
    result = creep.claimController(target)
    if (result === 0) {
      creep.signController(target, 'Auto-claiming. Redefined')
      MyRooms.add(creep.room, creep.motherRoom)
      return DONE
    } else if (creep.reserveController(target) === 0) return SUCCESS
    return FAILED
  } else {
    move.cheap(creep, target)
    return NOTHING_DONE
  }
  return FAILED
}
