import { SUCCESS, NOTHING_TODO } from 'constants/response'
import memoryLessDraw from './memoryLessDraw'

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
  target: AnyStoreStructure | Tombstone | Ruin | null | undefined = creep.memory
    ._draw && Game.getObjectById(creep.memory._draw),
  resourceType: ResourceConstant = creep.memory._drawType || RESOURCE_ENERGY,
) {
  if (!target) return NOTHING_TODO
  const result = memoryLessDraw(
    creep,
    target,
    resourceType,
    creep.memory._drawAmount,
  )
  if (result === SUCCESS) {
    delete creep.memory._draw
    delete creep.memory._drawAmount
    delete creep.memory._drawType
  }
  return result
}
