import { HARVESTING, UPGRADE, STORAGE_DRAW } from '../constants/state'
import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE, SUCCESS, NOTHING_TODO } from '../constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/work/autoPick'
import storageDraw from 'routine/work/storageDraw'
import drawContainer from 'routine/work/containerDraw';

export default function run(creep: Creep) {
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
        case NO_RESOURCE: case FAILED: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
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
    default: {
      creep.memory.state = HARVESTING
    }
  }
}
