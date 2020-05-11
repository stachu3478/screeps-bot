import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface DrawCreep extends Creep {
  memory: DrawMemory
}

interface DrawMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default function draw(creep: DrawCreep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  let target = Game.getObjectById(creep.memory._draw || ('' as Id<StructureContainer>))
  if (!target || target.store[RESOURCE_ENERGY] === 0) return NOTHING_TODO
  const result = creep.withdraw(target, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    delete creep.memory._draw
    return SUCCESS
  }
  return NOTHING_DONE
}
