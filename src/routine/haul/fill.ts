import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
}

export default function fill(creep: FillCreep) {
  const resourceType = creep.memory._fillType || RESOURCE_ENERGY
  if (creep.store[resourceType] === 0) return DONE
  let target = creep.memory._fill && Game.getObjectById(creep.memory._fill)
  if (!target || !(target.store as Store<ResourceConstant, false>).getFreeCapacity()) return NOTHING_TODO
  const result = creep.transfer(target, resourceType)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._fill
    delete creep.memory._fillType
    return SUCCESS
  }
  return NOTHING_DONE
}
