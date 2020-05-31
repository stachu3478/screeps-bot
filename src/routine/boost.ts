import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED } from 'constants/response'
import profiler from "screeps-profiler"

interface BoostCreep extends Creep {
  memory: BoostMemory
}

interface BoostMemory extends CreepMemory {
  _boostLab?: Id<StructureLab>
}

export default function boost(creep: BoostCreep, lab?: StructureLab) {
  const mem = creep.memory
  if (!lab) return NOTHING_TODO
  const result = lab.boostCreep(creep)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, lab)
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
