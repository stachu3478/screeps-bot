import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface DrawCreep extends Creep {
  memory: DrawMemory
}

interface DrawMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure | Tombstone | Ruin>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default function draw(
  creep: DrawCreep,
  target: AnyStoreStructure | Tombstone | Ruin | null | undefined = creep.memory._draw && Game.getObjectById(creep.memory._draw),
  resourceType: ResourceConstant = creep.memory._drawType || RESOURCE_ENERGY,
) {
  if (creep.store.getFreeCapacity(resourceType) === 0) return DONE
  if (!target || target.store[resourceType] === 0) return NOTHING_TODO
  const result = creep.withdraw(target, resourceType, creep.memory._drawAmount)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._draw
    delete creep.memory._drawAmount
    delete creep.memory._drawType
    return SUCCESS
  }
  return NOTHING_DONE
}
