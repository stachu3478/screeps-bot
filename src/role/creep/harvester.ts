import State from 'constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS } from 'constants/response'
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
import canUtilizeEnergy from 'job/canUtilizeEnergy';
import { LAB_MANAGER } from 'constants/role';

export default profiler.registerFN(function harvester(creep: Harvester) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (creep.store[RESOURCE_ENERGY]) energyUse(creep)
      else if (canUtilizeEnergy(creep)) energyHaul(creep)
      else creep.memory.role = LAB_MANAGER
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
      break
    case State.DISMANTLE:
      switch (dismantle(creep)) {
        case NOTHING_TODO: case FAILED: {
          delete creep.motherRoom.memory._dismantle
          creep.memory._arrive = creep.memory.room
          creep.memory.state = State.ARRIVE
        } break
        case DONE: {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = State.ARRIVE
        } break
      }
      break
    case State.HARVESTING:
      switch (drawContainer(creep)) {
        case DONE: case SUCCESS: energyUse(creep); break
        case FAILED:
          if (creep.room.name !== creep.memory.room) {
            creep.memory._arrive = creep.memory.room
            creep.memory.state = State.ARRIVE
          }
          autoPick(creep)
          break
        case NOTHING_TODO:
          energyHaul(creep)
          autoPick(creep)
          break
        case NOTHING_DONE: autoPick(creep)
      }
      break
    case State.FILL_PRIORITY:
      switch (priorityFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep)
        case NOTHING_DONE: autoRepair(creep); break;
      }
      break
    case State.REPAIR:
      switch (repair(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep)
        case NOTHING_DONE: autoRepair(creep); break;
      }
      break
    case State.BUILD:
      switch (build(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) energyHaul(creep); break
        case NOTHING_TODO: case FAILED: energyUse(creep)
        case NOTHING_DONE: autoRepair(creep); break;
      }
      break
    case State.STORAGE_FILL:
      switch (storageFill(creep)) {
        case NOTHING_DONE: autoRepair(creep); break;
        default: if (autoPick(creep) !== SUCCESS) energyHaul(creep);
      }
      break
    case State.STORAGE_DRAW:
      switch (drawStorage(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.IDLE; break
        case NOTHING_TODO: case FAILED: energyHaul(creep)
        case NOTHING_DONE: autoPick(creep); break
      }
      break
    case State.ARRIVE:
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: energyHaul(creep); break
      }
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: creep.memory.state = State.DISMANTLE; break
      }
      break
    default:
      energyHaul(creep)
  }
}, 'roleHarvester')
