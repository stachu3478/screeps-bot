import routineBooster from 'routine/boost'
import { NOTHING_DONE, SUCCESS } from 'constants/response'

export interface BoosterCreep extends Creep {
  memory: BoosterMemory
}

interface BoosterMemory extends CreepMemory {
  _boostLab?: Id<StructureLab>
  _targetRole?: number
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
          creep.room.boosts.clearRequest(
            creep.name,
            lab && lab.mineralType,
            result === SUCCESS,
          )
        }
        break
      default:
        const boosts = creep.room.boosts
        // FIXME: not always forcing works
        const targetLabId = boosts.getRequest(creep.name)
        if (targetLabId) {
          creep.memory.state = State.BOOST
          creep.memory._boostLab = targetLabId
        } else if (!boosts.hasMandatory(creep.name)) {
          const newRole = creep.memory._targetRole
          if (newRole) creep.memory.role = newRole
          delete creep.memory._targetRole
        }
    }
  },
}

export default roleBooster
