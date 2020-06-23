import State from 'constants/state'
import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE, SUCCESS, NOTHING_TODO } from 'constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import draw from 'routine/haul/draw';
import maintainControllerLink from 'utils/controllerLink';
import profiler from 'screeps-profiler'

export interface StaticUpgrader extends Creep {
  memory: StaticUpgraderMemory
}

interface StaticUpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _auto_repair?: Id<Structure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default profiler.registerFN(function staticUpgrader(creep: StaticUpgrader) {
  switch (creep.memory.state) {
    case State.UPGRADE:
      switch (upgrade(creep, true)) {
        case NO_RESOURCE: case FAILED:
          if (autoPick(creep) === SUCCESS) break
          const linkId = maintainControllerLink(creep.room, creep.store.getFreeCapacity(RESOURCE_ENERGY))
          if (linkId) {
            creep.memory.state = State.DRAW
            creep.memory._draw = linkId
            draw(creep)
          }
          break
        case NOTHING_DONE: autoRepair(creep); break
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case DONE: case SUCCESS: case NOTHING_TODO: case FAILED: creep.memory.state = State.UPGRADE; upgrade(creep, true); break
        case NOTHING_DONE: autoPick(creep); break;
      }
      break
    default:
      creep.memory.state = State.UPGRADE
  }
}, 'roleStaticUpgrader')
