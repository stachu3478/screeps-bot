import { HARVESTING, UPGRADE, STORAGE_DRAW, DRAW } from '../constants/state'
import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE, SUCCESS, NOTHING_TODO } from '../constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import storageDraw from 'routine/haul/storageDraw'
import drawContainer from 'routine/haul/containerDraw';
import draw from 'routine/haul/draw';
import maintainControllerLink from 'utils/controllerLink';

export interface UpgraderCreep extends Creep {
  memory: UpgraderMemory
}

interface UpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _auto_repair?: Id<Structure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default function upgrader(creep: UpgraderCreep) {
  switch (creep.memory.state) {
    case HARVESTING: {
      switch (drawContainer(creep)) {
        case DONE: case SUCCESS: creep.memory.state = UPGRADE; break
        case NOTHING_DONE: autoPick(creep); break
        case NOTHING_TODO: {
          creep.memory.state = STORAGE_DRAW
        } break
      }
    } break;
    case UPGRADE: {
      switch (upgrade(creep)) {
        case NO_RESOURCE: case FAILED: {
          if (autoPick(creep) === SUCCESS) break
          const linkId = maintainControllerLink(creep.room, creep.store.getFreeCapacity(RESOURCE_ENERGY))
          if (linkId) {
            creep.memory.state = DRAW
            creep.memory._draw = linkId
            draw(creep)
            break
          }
          creep.memory.state = HARVESTING
        }
        case NOTHING_DONE: autoRepair(creep); break
      }
    } break;
    case STORAGE_DRAW: {
      switch (storageDraw(creep)) {
        case DONE: case SUCCESS: creep.memory.state = UPGRADE; break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break;
      }
    } break
    case DRAW: {
      switch (draw(creep)) {
        case DONE: case SUCCESS: creep.memory.state = UPGRADE; break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break;
      }
    } break
    default: {
      creep.memory.state = HARVESTING
    }
  }
}
