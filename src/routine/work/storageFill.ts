import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

export default function fillStorage(creep: Creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target
  if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < TERMINAL_CAPACITY / 10) target = creep.room.terminal
  else target = Game.rooms[creep.memory.room].storage
  if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return NOTHING_TODO
  const result = creep.transfer(target, RESOURCE_ENERGY)
  const remaining = creep.store[RESOURCE_ENERGY] - target.store.getFreeCapacity(RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
