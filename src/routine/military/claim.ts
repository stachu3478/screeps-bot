import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface ClaimCreep extends Creep {
  memory: ClaimMemory
}

interface ClaimMemory extends CreepMemory { }

export default function claim(creep: ClaimCreep) {
  const target = creep.room.controller
  if (!target || target.my) return NOTHING_TODO
  let result
  if ((target.reservation && target.reservation.username !== "mocnyFull") || (target.level && !target.my)) result = creep.attackController(target)
  else if (creep.pos.isNearTo(target)) {
    result = creep.claimController(target)
    if (result === 0) {
      Memory.myRooms[creep.room.name] = 0
      creep.room.memory._claimer = creep.memory.room
      const mem = Memory.rooms[creep.memory.room]
      if (!mem._claimed) mem._claimed = []
      mem._claimed.push(creep.room.name)
      return DONE
    }
    else if (creep.reserveController(target) === 0) return SUCCESS
    return FAILED
  } else {
    cheapMove(creep, target)
    return NOTHING_DONE
  }
  return FAILED
}
