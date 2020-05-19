import _ from 'lodash'
import { SUCCESS, NOTHING_TODO, FAILED, DONE, NO_RESOURCE } from '../../constants/response'
import profiler from "screeps-profiler"

interface ToFill {
  [key: string]: number
}
const toFill: ToFill = {
  [STRUCTURE_TOWER]: 11,
  [STRUCTURE_SPAWN]: 10,
  [STRUCTURE_EXTENSION]: 9,
  [STRUCTURE_LAB]: 8,
  [STRUCTURE_NUKER]: 7,
  [STRUCTURE_LINK]: 6,
  [STRUCTURE_STORAGE]: 5,
  [STRUCTURE_TERMINAL]: 4,
  [STRUCTURE_POWER_SPAWN]: 3,
  [STRUCTURE_FACTORY]: 2,
  [STRUCTURE_CONTAINER]: 1,
}

interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default profiler.registerFN(function autoFill(creep: FillCreep) {
  let remaining = creep.store[RESOURCE_ENERGY]
  if (remaining === 0) return NO_RESOURCE
  const target = _.max(creep.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: s => {
      const storable = s as AnyStoreStructure
      return toFill[s.structureType]
        && storable.store
        && ((storable.store as StoreBase<ResourceConstant, false>).getFreeCapacity(RESOURCE_ENERGY) || 0) > 0
    }
  }) as AnyStoreStructure[], s => toFill[s.structureType] || 0)
  if (!target || !target.structureType) return NOTHING_TODO
  const result = creep.transfer(target, RESOURCE_ENERGY)
  remaining -= (target.store as StoreBase<ResourceConstant, false>).getFreeCapacity(RESOURCE_ENERGY)
  if (target.structureType === STRUCTURE_CONTAINER) creep.memory._draw = target.id
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'autoFillRoutine')
