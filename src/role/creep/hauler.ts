import { DONE, NOTHING_DONE, NOTHING_TODO, SUCCESS } from 'constants/response'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import recycle from 'routine/recycle'
import profiler from "screeps-profiler"
import Hauler from './hauler.d'
import pick from 'routine/haul/pick';
import resourceHaul from 'job/resourceHaul';
import fill from 'routine/haul/fill';
import draw from 'routine/haul/draw';
import dumpResources from 'job/dumpResources';
import collectGarbage from 'utils/collectGarbage';

export default profiler.registerFN(function hauler(creep: Hauler) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (creep.store.getUsedCapacity()) creep.memory.state = State.STORAGE_FILL
      else resourceHaul(creep)
      break
    case State.PICK:
      switch (pick(creep)) {
        case NOTHING_TODO:
        case DONE: dumpResources(creep, State.STORAGE_FILL)
      }
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case DONE: collectGarbage(creep.name)
      }
      break;
    case State.DRAW:
      switch (draw(creep)) {
        case NOTHING_TODO:
        case DONE: dumpResources(creep, State.STORAGE_FILL)
      }
      break
    case State.STORAGE_FILL:
      switch (fill(creep)) {
        case NOTHING_DONE: break;
        default:
          if (creep.store.getUsedCapacity()) dumpResources(creep, State.STORAGE_FILL)
          else if (autoPick(creep) !== SUCCESS) resourceHaul(creep);
      }
      break;
    case State.ARRIVE:
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: resourceHaul(creep); break
      }
      break;
    default:
      resourceHaul(creep)
  }
}, 'roleHauler')
