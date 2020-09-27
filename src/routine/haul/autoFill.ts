import {
  SUCCESS,
  NOTHING_TODO,
  FAILED,
  DONE,
  NO_RESOURCE,
} from '../../constants/response'
import profiler from 'screeps-profiler'
import { findNearStructureToFillWithPriority } from 'utils/find'
import { getLink, getXYContainer } from 'utils/selectFromPos'
import { energyToUpgradeThreshold } from 'config/link'

interface FillCreep extends Creep {
  memory: FillMemory
}

interface FillMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

export default profiler.registerFN(function autoFill(
  creep: FillCreep,
  shouldSendToController: boolean = false,
) {
  let remaining = creep.store[RESOURCE_ENERGY]
  if (remaining === 0) return NO_RESOURCE
  const target = findNearStructureToFillWithPriority(
    creep.room,
    creep.pos.x,
    creep.pos.y,
  )
  if (!target || !target.structureType) return NOTHING_TODO
  const result = creep.transfer(target, RESOURCE_ENERGY)
  remaining -= (target.store as StoreBase<
    ResourceConstant,
    false
  >).getFreeCapacity(RESOURCE_ENERGY)
  if (result !== 0) return FAILED
  else {
    if (target.structureType !== STRUCTURE_CONTAINER) {
      const container = getXYContainer(creep.room, creep.pos.x, creep.pos.y)
      if (container && container.store[RESOURCE_ENERGY])
        creep.withdraw(container, RESOURCE_ENERGY)
    }
    if (remaining <= 0) return DONE
    if (shouldSendToController && target.structureType === STRUCTURE_LINK) {
      const linkPos = creep.room.memory.controllerLink
      if (linkPos) {
        const controllerLink = getLink(creep.room, linkPos.charCodeAt(0))
        if (
          controllerLink &&
          controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >
            energyToUpgradeThreshold
        )
          target.transferEnergy(controllerLink)
      }
    }
    return SUCCESS
  }
},
'autoFillRoutine')
