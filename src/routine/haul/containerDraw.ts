import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'
import { findClosestFilledContainer } from 'utils/find';
import { getContainer } from 'utils/selectFromPos';

interface DrawContainerCreep extends Creep {
  memory: DrawContainerMemory
}

interface DrawContainerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default function drawContainer(creep: DrawContainerCreep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = creep.memory._draw && Game.getObjectById(creep.memory._draw)
  if (!target || target.store[RESOURCE_ENERGY] === 0) {
    let newTarget
    const roomMem = creep.room.memory
    if (roomMem._linked && roomMem.colonySources && roomMem.colonySourceId) {
      const container = getContainer(creep.room, roomMem.colonySources[roomMem.colonySourceId].charCodeAt(0))
      if (container && container.store[RESOURCE_ENERGY] > 0) newTarget = container
    } else newTarget = findClosestFilledContainer(creep.pos)
    if (!newTarget) return NOTHING_TODO
    target = newTarget
    creep.memory._draw = target.id
  }
  const result = creep.withdraw(target, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._draw
    return SUCCESS
  }
  return NOTHING_DONE
}
