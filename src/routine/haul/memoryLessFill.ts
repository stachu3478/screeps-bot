import move from '../../utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'

export default function memoryLessFill(
  creep: Creep,
  target: AnyStoreStructure,
  resourceType: ResourceConstant,
  onlyCurrentRoom: boolean = false,
) {
  if (creep.store[resourceType] === 0) return DONE
  if (!target.store.getFreeCapacity(resourceType)) return NOTHING_TODO
  const result = creep.transfer(target, resourceType)
  if (creep.name === 'J9') console.log(result)
  if (result === ERR_NOT_IN_RANGE) {
    const result = move.cheap(creep, target)
    if (creep.name === 'J9') console.log(result)
    if (result === ERR_NO_PATH) {
      move.anywhere(creep, creep.pos.getDirectionTo(target))
      return 0
    }
  } else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
