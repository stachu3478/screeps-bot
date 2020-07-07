import { FillCreep } from "routine/haul/fill";
import { getFillableGenericStruture } from "utils/fill";

export default function dumpResources(creep: FillCreep, targetState: number, fallbackState: number = State.IDLE) {
  creep.memory.state = fallbackState
  for (const name in creep.store) {
    const resource = name as ResourceConstant
    if (creep.store[resource] > 0) {
      const potentialStructure = getFillableGenericStruture(creep.motherRoom)
      if (potentialStructure) {
        creep.memory._fill = potentialStructure.id
        creep.memory._fillType = resource
        creep.memory.state = targetState
      } else creep.drop(resource)
      break
    }
  }
}
