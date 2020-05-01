import { cheapMove } from '../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from '../constants/response'

export default function claim(creep: Creep) {
  const target = creep.room.controller
  if (!target || target.my) return NOTHING_TODO
  let result
  if (target.reservation || target.level) result = creep.attackController(target)
  else {
    result = creep.claimController(target)
    if (result === 0) {
      Memory.myRooms[creep.room.name] = 0
      creep.room.memory._claimer = creep.memory.room
      return DONE
    }
    else if (creep.reserveController(target) === 0) return SUCCESS
  }
  if (result === ERR_NOT_IN_RANGE) {
    cheapMove(creep, target)
    return NOTHING_DONE
  } else return FAILED
}
