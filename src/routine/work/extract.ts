import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

export default function extract(creep: Creep) {
  if (creep.store.getFreeCapacity() === 0) return DONE
  const target = Game.getObjectById(creep.room.memory._mineral || ('' as Id<Mineral>))
  if (!target) return NOTHING_TODO
  const result = creep.harvest(target)
  const remaining = creep.store.getFreeCapacity() - creep.getActiveBodyparts(WORK) * HARVEST_MINERAL_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result === ERR_TIRED) return NOTHING_DONE
  else if (result !== 0) return FAILED
  else {
    creep.memory._extract = target.mineralType
    if (remaining <= 0) return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
