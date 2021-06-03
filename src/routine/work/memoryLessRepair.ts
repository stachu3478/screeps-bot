import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
} from 'constants/response'
import { CREEP_RANGE } from 'constants/support'

export default function memoryLessRepair(
  creep: Creep,
  target: Structure<BuildableStructureConstant>,
) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  if (target.hits === target.hitsMax) return NOTHING_TODO
  const result = creep.repair(target)
  const remaining = storedEnergy - creep.corpus.count(WORK)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target, false, CREEP_RANGE)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
