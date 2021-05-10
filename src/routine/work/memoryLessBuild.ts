import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
} from '../../constants/response'

export default function memoryLessBuild(
  creep: Creep,
  target: ConstructionSite,
) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  if (!target) return NOTHING_TODO
  const result = creep.build(target)
  const remaining = storedEnergy - creep.workpartCount * BUILD_POWER
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target, false, 3)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}