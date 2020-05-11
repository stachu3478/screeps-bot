import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

interface SpawnFillCreep extends Creep {
  memory: SpawnFillMemory
}

interface SpawnFillMemory extends CreepMemory {
  _fillSpawn?: Id<StructureSpawn | StructureExtension>
}

export default function fillSpawn(creep: SpawnFillCreep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(creep.memory._fillSpawn || ('' as Id<StructureSpawn>))
  if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    const newTarget = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_SPAWN
        || s.structureType === STRUCTURE_EXTENSION)
        && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    if (!newTarget) return NOTHING_TODO
    if (newTarget.structureType !== STRUCTURE_EXTENSION && newTarget.structureType !== STRUCTURE_SPAWN) return FAILED
    target = newTarget
    creep.memory._fillSpawn = target.id
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