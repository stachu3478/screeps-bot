import routineBooster from 'routine/boost'
import { NOTHING_DONE, SUCCESS } from 'constants/response'

export interface BoosterCreep extends RoleCreep<any> {
  memory: BoosterMemory
}

interface BoosterMemory extends RoleCreepMemory<any> {
  _boostLab?: Id<StructureLab>
}

const roleBooster = {
  run: (creep: BoosterCreep) => {
    switch (creep.memory.state) {
      case State.BOOST:
        const lab = Game.getObjectById(
          creep.memory._boostLab || ('' as Id<StructureLab>),
        )
        const result = routineBooster.run(creep, lab)
        if (result !== NOTHING_DONE) {
          delete creep.memory.state
          creep.room.boosts.clearRequests(
            creep.name,
            lab && lab.mineralType,
            result === SUCCESS,
          )
        }
        break
      default:
        const boosts = creep.room.boosts
        const targetLabId = boosts.getRequest(creep.name)
        if (targetLabId) {
          creep.memory.state = State.BOOST
          creep.memory._boostLab = targetLabId
        } else if (!boosts.hasMandatory(creep.name)) {
          const newRole = creep.memory.newRole
          if (newRole) creep.memory.role = newRole
          delete creep.memory.newRole
        }
    }
  },
}

export default roleBooster
