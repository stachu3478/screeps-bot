import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'
import { reserveSource, unReserveSource } from 'checker/reserveSource'
import { roomPos } from 'planner/pos'

export default function harvest(creep: Creep, sourceId?: Id<Source>) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = Game.getObjectById(creep.memory._harvest || ('' as Id<Source>))
  if (!target || !target.energy || !reserveSource(creep, target)) {
    unReserveSource(creep)
    if (sourceId) target = Game.getObjectById(sourceId)
    if (!target || !target.energy || !reserveSource(creep, target)) target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
    if (!target || !reserveSource(creep, target)) return NOTHING_TODO
    creep.memory._harvest = target.id
  }
  let targetPos
  if (creep.memory._sourceResevation) targetPos = roomPos(creep.memory._sourceResevation, creep.room.name)
  else {
    targetPos = target.pos
    if (creep.pos.getRangeTo(targetPos) > 1) cheapMove(creep, targetPos)
    return NOTHING_DONE
  }
  if (!creep.pos.isEqualTo(targetPos)) {
    cheapMove(creep, targetPos)
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  const remaining = creep.store.getFreeCapacity() - creep.getActiveBodyparts(WORK) * HARVEST_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, targetPos)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) {
      unReserveSource(creep)
      delete creep.memory._harvest
      return DONE
    }
    return SUCCESS
  }
  return NOTHING_DONE
}
