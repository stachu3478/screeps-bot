import { DONE } from 'constants/response'
import arrive from 'routine/arrive'

export default function colonizer(creep: RoleCreep<any>) {
  switch (creep.memory.state) {
    case State.ARRIVE:
      switch (arrive(creep)) {
        case DONE:
          creep.memory.role = creep.memory.newRole
          break
      }
      break
    default:
      creep.memory.state = State.ARRIVE
  }
}
