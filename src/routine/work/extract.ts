import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'

export default function extract(creep: Creep, cheapMove = move.cheap) {
  if (creep.store.getFreeCapacity() === 0) return DONE
  const target = creep.motherRoom.mineral
  if (!target || !target.mineralAmount) return NOTHING_TODO
  const result = creep.harvest(target)
  const remaining =
    creep.store.getFreeCapacity() - creep.workpartCount * HARVEST_MINERAL_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result === ERR_TIRED) return NOTHING_DONE
  else if (result === ERR_NOT_FOUND) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
