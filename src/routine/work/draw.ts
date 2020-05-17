import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface DrawCreep extends Creep {
  memory: DrawMemory
}

interface DrawMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default function draw(creep: DrawCreep) {
  const resourceType = creep.memory._drawType || RESOURCE_ENERGY
  if (creep.store.getFreeCapacity(resourceType) === 0) return DONE
  let target = Game.getObjectById(creep.memory._draw || ('' as Id<StructureContainer>))
  if (!target || target.store[resourceType] === 0) return NOTHING_TODO
  const result = creep.withdraw(target, resourceType, creep.memory._drawAmount)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._draw
    delete creep.memory._drawAmount
    delete creep.memory._drawType
    return SUCCESS
  }
  return NOTHING_DONE
}
