import { NOTHING_TODO } from 'constants/response'
import { findClosestFilledContainer } from 'utils/find';
import { getContainer } from 'utils/selectFromPos';
import draw from './draw';

interface DrawContainerCreep extends Creep {
  memory: DrawContainerMemory
}

interface DrawContainerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default function drawContainer(creep: DrawContainerCreep) {
  let target = creep.memory._draw && Game.getObjectById(creep.memory._draw)
  if (!target || target.store[RESOURCE_ENERGY] === 0) {
    const roomMem = creep.room.memory
    if (creep.room.linked && roomMem.colonySources && roomMem.colonySourceId) {
      const container = getContainer(creep.room, roomMem.colonySources[roomMem.colonySourceId].charCodeAt(0))
      if (container && container.store[RESOURCE_ENERGY] > 0) target = container
    } else target = findClosestFilledContainer(creep.pos)
    if (!target) return NOTHING_TODO
    creep.memory._draw = target.id
  }
  return draw(creep)
}
