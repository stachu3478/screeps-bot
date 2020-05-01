import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

export default function drawStorage(creep: Creep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = Game.rooms[creep.memory.room].storage
  if (!target || target.store[RESOURCE_ENERGY] === 0) return NOTHING_TODO
  const result = creep.withdraw(target, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
