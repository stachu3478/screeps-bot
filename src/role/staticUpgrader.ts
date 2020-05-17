import { UPGRADE, DRAW } from '../constants/state'
import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE, SUCCESS, NOTHING_TODO } from '../constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/work/autoPick'
import draw from 'routine/work/draw';
import maintainControllerLink from 'utils/controllerLink';

export interface StaticUpgrader extends Creep {
  memory: StaticUpgraderMemory
}

interface StaticUpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _auto_repair?: Id<Structure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default function staticUpgrader(creep: StaticUpgrader) {
  switch (creep.memory.state) {
    case UPGRADE: {
      switch (upgrade(creep, true)) {
        case NO_RESOURCE: case FAILED: {
          if (autoPick(creep) === SUCCESS) break
          const linkId = maintainControllerLink(creep.room, creep.store.getFreeCapacity(RESOURCE_ENERGY))
          if (linkId) {
            creep.memory.state = DRAW
            creep.memory._draw = linkId
            draw(creep)
          }
        } break
        case NOTHING_DONE: autoRepair(creep); break
      }
    } break;
    case DRAW: {
      switch (draw(creep)) {
        case DONE: case SUCCESS: case NOTHING_TODO: case FAILED: creep.memory.state = UPGRADE; upgrade(creep, true); break
        case NOTHING_DONE: autoPick(creep); break;
      }
    } break
    default: {
      creep.memory.state = UPGRADE
    }
  }
}
