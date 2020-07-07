import profiler from 'screeps-profiler'
import { SUCCESS, NOTHING_TODO, FAILED, DONE, NOTHING_DONE } from '../../constants/response'
import { getDroppedResource } from 'utils/find';

interface AutoPickCreep extends Creep {
  memory: AutoPickMemory
}

interface AutoPickMemory extends CreepMemory {
  _pick?: Id<Resource>
}

export default profiler.registerFN(function pick(creep: AutoPickCreep) {
  let target = creep.memory._pick && Game.getObjectById(creep.memory._pick)
  let remaining = creep.store.getFreeCapacity()
  if (remaining === 0) return DONE
  if (!target) {
    target = target || getDroppedResource(creep.pos)
    if (!target) return NOTHING_TODO
    creep.memory._pick = target.id
  }
  const result = creep.pickup(target)
  remaining -= target.amount
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target)
    return NOTHING_DONE
  }

  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'autoPickRoutine')
