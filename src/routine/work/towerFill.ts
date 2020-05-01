import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

export default function fillTower(creep: Creep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(creep.memory._fill || ('' as Id<StructureTower>))
  if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    const newTarget = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_TOWER)
        && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    if (!newTarget) return NOTHING_TODO
    if (newTarget.structureType !== STRUCTURE_TOWER) return FAILED
    target = newTarget
    creep.memory._fill = target.id
  }
  const result = creep.transfer(target, RESOURCE_ENERGY)
  const remaining = creep.store[RESOURCE_ENERGY] - target.store.getFreeCapacity(RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
