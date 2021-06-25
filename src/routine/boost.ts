import move from 'utils/path/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED } from 'constants/response'

interface BoostCreep extends Creep {
  memory: BoostMemory
}

interface BoostMemory extends CreepMemory {
  _boostLab?: Id<StructureLab>
}

const routineBooster = {
  run: (creep: BoostCreep, lab: StructureLab | null) => {
    if (!lab) return NOTHING_TODO
    const result = lab.boostCreep(creep)
    if (result === ERR_NOT_IN_RANGE) move.cheap(creep, lab)
    else if (result !== 0) return FAILED
    else {
      return SUCCESS
    }
    return NOTHING_DONE
  },
}

export default routineBooster
