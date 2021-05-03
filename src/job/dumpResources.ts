import { FillCreep } from 'routine/haul/fill'
import { getFillableGenericStruture } from 'utils/fill'

export default function dumpResources(
  creep: FillCreep,
  targetState?: number,
  fallbackState: number = State.IDLE,
) {
  creep.memory.state = fallbackState
  if (creep.store.getUsedCapacity() === 0) return false
  for (const name in creep.store) {
    const resource = name as ResourceConstant
    if (creep.store[resource] > 0) {
      const potentialStructure = getFillableGenericStruture(creep.motherRoom)
      if (potentialStructure) {
        creep.memory[Keys.fillTarget] = potentialStructure.id
        creep.memory[Keys.fillType] = resource
        if (targetState) creep.memory.state = targetState
      } else creep.drop(resource)
      return true
    }
  }
  return false
}
