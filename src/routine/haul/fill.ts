import { SUCCESS, NOTHING_TODO } from 'constants/response'
import memoryLessFill from './memoryLessFill'

export interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
}

export default function fill(
  creep: FillCreep,
  target: AnyStoreStructure | null | undefined = creep.memory[
    Keys.fillTarget
  ] && Game.getObjectById(creep.memory[Keys.fillTarget] || ''),
  resourceType: ResourceConstant = creep.memory[Keys.fillType] ||
    RESOURCE_ENERGY,
) {
  if (!target) return NOTHING_TODO
  const result = memoryLessFill(creep, target, resourceType)
  if (result === SUCCESS) {
    delete creep.memory[Keys.fillTarget]
    delete creep.memory[Keys.fillType]
  }
  return result
}
