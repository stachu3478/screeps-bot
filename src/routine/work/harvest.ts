import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'
import { roomPos } from 'planner/pos'

export default function harvest(creep: Creep, sourceId?: Id<Source>) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = Game.getObjectById(creep.memory._harvest || ('' as Id<Source>))
  if (!target || !target.energy) {
    if (sourceId && (!target || target.id !== sourceId)) target = Game.getObjectById(sourceId)
    if (!target || !target.energy) return NOTHING_TODO
    creep.memory._harvest = target.id
  }
  let targetPos
  if (!creep.room.memory.colonySources) return FAILED
  targetPos = roomPos(creep.room.memory.colonySources[target.id][0], creep.room.name)
  if (!creep.pos.isEqualTo(targetPos)) {
    cheapMove(creep, targetPos)
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  creep.say(result + '')
  const remaining = creep.store.getFreeCapacity(RESOURCE_ENERGY) - creep.getActiveBodyparts(WORK) * HARVEST_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, targetPos)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
  return NOTHING_DONE
}
