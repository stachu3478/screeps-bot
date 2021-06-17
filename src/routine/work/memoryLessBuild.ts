import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
} from '../../constants/response'
import { CREEP_RANGE } from 'constants/support'

export default function memoryLessBuild(
  creep: Creep,
  target: ConstructionSite,
) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  if (!target) return NOTHING_TODO
  const result = creep.build(target)
  const remaining = storedEnergy - creep.corpus.count(WORK) * BUILD_POWER
  if (result === ERR_NOT_IN_RANGE) {
    if (creep.room.name !== target.pos.roomName) {
      creep.moveToRoom(target.pos.roomName)
    } else {
      move.cheap(creep, target, false, CREEP_RANGE)
    }
  } else if (result === ERR_INVALID_TARGET) {
    return FAILED
  } else if (result !== 0) {
    if (target.pos.lookFor(LOOK_CREEPS).find((c) => c.my && move.anywhere(c)))
      return SUCCESS
    return FAILED
  } else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
