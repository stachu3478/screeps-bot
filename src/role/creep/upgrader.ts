import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE, SUCCESS, NOTHING_TODO } from 'constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import storageDraw from 'routine/haul/storageDraw'
import drawContainer from 'routine/haul/containerDraw';
import draw from 'routine/haul/draw';
import maintainControllerLink from 'utils/controllerLink';
import profiler from "screeps-profiler"
import { energyToUpgraderRepairThreshold } from 'config/storage';

export interface UpgraderCreep extends Creep {
  memory: UpgraderMemory
}

interface UpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _auto_repair?: Id<Structure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default profiler.registerFN(function upgrader(creep: UpgraderCreep) {
  switch (creep.memory.state) {
    case State.HARVESTING:
      switch (drawContainer(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.UPGRADE; break
        case NOTHING_DONE: autoPick(creep); break
        case NOTHING_TODO:
          creep.memory.state = State.STORAGE_DRAW
          break
      }
      break
    case State.UPGRADE:
      switch (upgrade(creep)) {
        case NO_RESOURCE: case FAILED:
          if (autoPick(creep) === SUCCESS) break
          const linkId = maintainControllerLink(creep.room, creep.store.getFreeCapacity(RESOURCE_ENERGY))
          if (linkId) {
            creep.memory.state = State.DRAW
            creep.memory._draw = linkId
            draw(creep)
            break
          }
          creep.memory.state = State.HARVESTING
          break
        default: if (creep.room.store(RESOURCE_ENERGY) >= energyToUpgraderRepairThreshold || !creep.room.storage) autoRepair(creep); break
      }
      break
    case State.STORAGE_DRAW:
      switch (storageDraw(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.UPGRADE; break
        case NOTHING_TODO: case FAILED: creep.memory.state = State.HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break;
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.UPGRADE; break
        case NOTHING_TODO: case FAILED: creep.memory.state = State.HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break;
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
}, 'roleUpgrader')
