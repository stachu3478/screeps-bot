import routineBooster from "routine/boost";
import { NOTHING_DONE } from "constants/response";

export interface BoosterCreep extends Creep {
  memory: BoosterMemory
}

interface BoosterMemory extends CreepMemory {
  _boostLab?: Id<StructureLab>
  _targetRole: number
}

const roleBooster = {
  run: (creep: BoosterCreep) => {
    switch (creep.memory.state) {
      case State.BOOST:
        const lab = Game.getObjectById(creep.memory._boostLab || ('' as Id<StructureLab>))
        const result = routineBooster.run(creep, lab)
        if (result !== NOTHING_DONE) {
          delete creep.memory.state
          creep.room.clearBoostRequest(creep.name, lab && lab.mineralType)
        }
        break
      default:
        const targetLabId = creep.room.getBoostRequest(creep.name)
        if (targetLabId) {
          creep.memory.state = State.BOOST
          creep.memory._boostLab = targetLabId
        } else {
          creep.memory.role = creep.memory._targetRole
          delete creep.memory._targetRole
        }
    }
  },
}

export default roleBooster
