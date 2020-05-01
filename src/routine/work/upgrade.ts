import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

export default function upgrade(creep: Creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.rooms[creep.memory.room].controller
  if (!target) return FAILED
  const result = creep.upgradeController(target)
  const remaining = creep.store[RESOURCE_ENERGY] - creep.getActiveBodyparts(WORK)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (!creep.pos.isNearTo(target)) cheapMove(creep, target)
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
