import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface DrawContainerCreep extends Creep {
  memory: DrawContainerMemory
}

interface DrawContainerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default function drawContainer(creep: DrawContainerCreep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = Game.getObjectById(creep.memory._draw || ('' as Id<StructureContainer>))
  if (!target || target.store[RESOURCE_ENERGY] === 0) {
    const newTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
    }) as StructureContainer | undefined
    if (!newTarget) return NOTHING_TODO
    if (newTarget.structureType !== STRUCTURE_CONTAINER) return FAILED
    target = newTarget
    creep.memory._draw = target.id
  }
  const result = creep.withdraw(target, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._draw
    return SUCCESS
  }
  return NOTHING_DONE
}
