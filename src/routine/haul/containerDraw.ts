import { NOTHING_TODO } from 'constants/response'
import { findClosestFilledContainer } from 'utils/find'
import draw from './draw'

interface DrawContainerCreep extends Creep {
  memory: DrawContainerMemory
}

interface DrawContainerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default function drawContainer(creep: DrawContainerCreep) {
  let target = creep.memory._draw && Game.getObjectById(creep.memory._draw)
  if (!target || target.store[RESOURCE_ENERGY] === 0) {
    if (creep.room.linked) {
      const containerPosition = creep.room.sources.colonyPosition
      const container = containerPosition
        .lookFor(LOOK_STRUCTURES)
        .find((s) => s.structureType === STRUCTURE_CONTAINER) as
        | StructureContainer
        | undefined
      if (container && container.store[RESOURCE_ENERGY] > 0) target = container
    } else target = findClosestFilledContainer(creep.pos)
    if (!target) return NOTHING_TODO
    creep.memory._draw = target.id
  }
  return draw(creep)
}
