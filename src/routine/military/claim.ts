import _ from 'lodash'
import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'
import MyRooms from 'room/MyRooms'

interface ClaimCreep extends Creep {
  memory: ClaimMemory
}

interface ClaimMemory extends CreepMemory {}

const myStructure = _.find(Game.spawns) || _.find(Game.creeps)
const myUsername = myStructure && myStructure.owner.username

export default function claim(creep: ClaimCreep) {
  const target = creep.room.controller
  if (!target || target.my) return NOTHING_TODO
  let result
  if (
    (target.reservation && target.reservation.username !== myUsername) ||
    (target.level && !target.my)
  )
    result = creep.attackController(target)
  else if (creep.pos.isNearTo(target)) {
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
