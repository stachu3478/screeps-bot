import { HARVESTING, TOWER_FILL, REPAIR, BUILD, STORAGE_DRAW, FORTIFY } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS, ACCEPTABLE } from '../constants/response'
import towerFill from 'routine/work/towerFill'
import storageDraw from 'routine/work/storageDraw'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/work/autoPick'
import fortify from 'routine/military/fortify'
import drawContainer from 'routine/work/containerDraw';
import { cheapMove } from 'utils/path';

export default function run(creep: Creep) {
  switch (creep.memory.state) {
    case HARVESTING: {
      switch (drawContainer(creep)) {
        case DONE: creep.memory.state = TOWER_FILL; break
        case FAILED: case NOTHING_TODO: {
          if (creep.room.storage) creep.memory.state = STORAGE_DRAW
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break;
    case TOWER_FILL: {
      switch (towerFill(creep)) {
        case NO_RESOURCE: {
          if (autoPick(creep) === SUCCESS) break
          if (storageDraw(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = FORTIFY; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: {
          if (autoPick(creep) === SUCCESS) break
          if (storageDraw(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = BUILD; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      switch (build(creep)) {
        case NO_RESOURCE: {
          if (autoPick(creep) === SUCCESS) break
          if (storageDraw(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_TODO: {
          creep.memory.state = FORTIFY
        }; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case FORTIFY: {
      switch (fortify(creep)) {
        case SUCCESS: case DONE: {
          if (creep.memory._repair) creep.memory.state = REPAIR
          else creep.memory.state = BUILD
        } break
        case NOTHING_DONE: autoRepair(creep); break;
        case FAILED: cheapMove(creep, creep.room.controller || Game.spawns[creep.room.memory.spawnName || ''])
      }
    } break;
    case STORAGE_DRAW: {
      switch (storageDraw(creep)) {
        case DONE: case SUCCESS: {
          if (towerFill(creep) in ACCEPTABLE) creep.memory.state = TOWER_FILL
          else creep.memory.state = FORTIFY
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
    default: {
      creep.memory.state = FORTIFY
      fortify(creep)
      if (creep.memory._repair) creep.memory.state = REPAIR
      else if (creep.memory._build) creep.memory.state = BUILD
    }
  }
}
