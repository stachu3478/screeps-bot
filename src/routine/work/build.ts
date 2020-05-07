import { cheapMove } from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from '../../constants/response'

export default function build(creep: Creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(creep.memory._build || ('' as Id<ConstructionSite>))
  if (!target) {
    target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
    if (!target) return NOTHING_TODO
    creep.memory._build = target.id
  }
  const result = creep.build(target)
  const remaining = creep.store[RESOURCE_ENERGY] - creep.getActiveBodyparts(WORK) * BUILD_POWER
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
