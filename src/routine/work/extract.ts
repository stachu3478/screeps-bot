import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface ExtractCreep extends Creep {
  memory: ExtractMemory
}

interface ExtractMemory extends CreepMemory {
  _extract?: MineralConstant
}

export default function extract(creep: ExtractCreep) {
  if (creep.store.getFreeCapacity() === 0) return DONE
  const target = Game.getObjectById(creep.room.memory._mineral || ('' as Id<Mineral>))
  if (!target || !target.mineralAmount) return NOTHING_TODO
  const result = creep.harvest(target)
  const remaining = creep.store.getFreeCapacity() - creep.getActiveBodyparts(WORK) * HARVEST_MINERAL_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result === ERR_TIRED) return NOTHING_DONE
  else if (result === ERR_NOT_FOUND) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else {
    creep.memory._extract = target.mineralType
    if (remaining <= 0) return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
