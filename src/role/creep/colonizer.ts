import { DONE } from 'constants/response'
import arrive from 'routine/arrive'

export interface Colonizer extends Creep {
  memory: ColonizerMemory
}

export interface ColonizerMemory extends CreepMemory {
  _arrive?: string
  _targetRole: number
}

export default function colonizer(creep: Colonizer) {
  switch (creep.memory.state) {
    case State.ARRIVE:
      switch (arrive(creep)) {
        case DONE:
          creep.memory.role = creep.memory._targetRole
          break
      }
      break
    default:
      creep.memory.state = State.ARRIVE
  }
}
