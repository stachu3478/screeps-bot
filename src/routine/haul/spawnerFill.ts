import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'
import { findClosestHatchToFill } from 'utils/find';

interface SpawnFillCreep extends Creep {
  memory: SpawnFillMemory
}

interface SpawnFillMemory extends CreepMemory {
  _fillSpawn?: Id<StructureSpawn | StructureExtension>
}

export default function fillSpawn(creep: SpawnFillCreep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) return NOTHING_TODO
  let target = creep.memory._fillSpawn && Game.getObjectById(creep.memory._fillSpawn)
  if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    const newTarget = findClosestHatchToFill(creep.pos)
    if (!newTarget) return NOTHING_TODO
    target = newTarget
    creep.memory._fillSpawn = target.id
  }
  const result = creep.transfer(target, RESOURCE_ENERGY)
  const remaining = creep.store[RESOURCE_ENERGY] - target.store.getFreeCapacity(RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    else {
      const newTarget = findClosestHatchToFill(creep.pos, target)
      if (!newTarget) return NOTHING_TODO
      target = newTarget
      creep.memory._fillSpawn = target.id
      if (!creep.pos.isNearTo(target)) cheapMove(creep, target)
    }
    return SUCCESS
  }
  return NOTHING_DONE
}
