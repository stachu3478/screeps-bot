import { HARVESTING, REPAIR, BUILD, ARRIVE, ARRIVE_HOSTILE, DISMANTLE, STORAGE_FILL, STORAGE_DRAW, RECYCLE, IDLE, FILL_PRIORITY } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS } from '../constants/response'
import storageFill from 'routine/haul/storageFill'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import recycle from 'routine/recycle'
import drawContainer from 'routine/haul/containerDraw';
import drawStorage from 'routine/haul/storageDraw';
import profiler from "screeps-profiler"
import energyHaul from 'job/energyHaul'
import energyUse from 'job/energyUse'
import Harvester from './harvester.d'
import priorityFill from 'routine/haul/priorityFill';

export default profiler.registerFN(function harvester(creep: Harvester) {
  switch (creep.memory.state) {
    case IDLE: {
      if (creep.store[RESOURCE_ENERGY]) energyUse(creep)
      else energyHaul(creep)
    } break
    case RECYCLE: {
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
    } break;
    case DISMANTLE: {
      switch (dismantle(creep)) {
        case NOTHING_TODO: case FAILED: {
          delete creep.room.memory._dismantle
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
        case DONE: {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
      }
    } break;
    case HARVESTING: {
      switch (drawContainer(creep)) {
        case DONE: case SUCCESS: energyUse(creep); break
        case FAILED: {
          if (creep.room.name !== creep.memory.room) {
            creep.memory._arrive = creep.memory.room
            creep.memory.state = ARRIVE
          }
          autoPick(creep)
        } break
        case NOTHING_TODO: {
          energyHaul(creep)
          autoPick(creep)
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break;
    case FILL_PRIORITY: {
      switch (priorityFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      switch (build(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_FILL: {
      switch (storageFill(creep)) {
        case NOTHING_DONE: autoRepair(creep); break;
        default: if (autoPick(creep) !== SUCCESS) energyHaul(creep);
      }
    } break;
    case STORAGE_DRAW: {
      switch (drawStorage(creep)) {
        case DONE: case SUCCESS: creep.memory.state = IDLE; break
        case NOTHING_TODO: case FAILED: energyHaul(creep); break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
    case ARRIVE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: energyHaul(creep); break
      }
    } break;
    case ARRIVE_HOSTILE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: creep.memory.state = DISMANTLE; break
      }
    } break;
    default: {
      energyHaul(creep)
    }
  }
}, 'roleHarvester')
