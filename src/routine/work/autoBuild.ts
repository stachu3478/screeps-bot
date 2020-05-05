import { SUCCESS, NOTHING_TODO, FAILED, NO_RESOURCE } from '../../constants/response'

export default function autoBuild(creep: Creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(creep.memory._build || ('' as Id<ConstructionSite>))
  if (!target) {
    target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0]
    if (!target) return NOTHING_TODO
    creep.memory._build = target.id
  }
  const result = creep.build(target)
  const remaining = creep.store[RESOURCE_ENERGY] - creep.getActiveBodyparts(WORK) * BUILD_POWER
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
}
