import {
  DONE,
  NOTHING_DONE,
  NOTHING_TODO,
  FAILED,
  NO_RESOURCE,
  SUCCESS,
} from 'constants/response'
import storageFill from 'routine/haul/storageFill'
import repair from 'routine/work/repair'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import drawStorage from 'routine/haul/storageDraw'
import profiler from 'screeps-profiler'
import energyHaul from 'job/energyHaul'
import Harvester from './harvester.d'
import draw from 'routine/haul/draw'
import fill from 'routine/haul/fill'
import dumpResources from 'job/dumpResources'
import { haulCurrentRoom } from 'job/resourceHaul'
import pick from 'routine/haul/pick'
import move from 'utils/path'

function nativeRoutineHandler(creep: Harvester, result: number) {
  switch (result) {
    case NO_RESOURCE:
    case NOTHING_TODO:
    case FAILED:
      creep.memory.state = State.IDLE
    case NOTHING_DONE:
      autoRepair(creep)
      break
  }
}

export default profiler.registerFN(function harvester(creep: Harvester) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (haulCurrentRoom(creep)) break
      else if (creep.routeProcessor.process()) {
        if (creep.routeProcessor.isJobFound())
          creep.memory.state = State.HARVESTING
      } else if (creep.buildingRouteProcessor.doJob()) {
        creep.memory.state = State.BUILD
      } else {
        creep.memory.role = Role.LAB_MANAGER
      }
      break
    case State.DISMANTLE:
      switch (dismantle(creep)) {
        case NOTHING_TODO:
        case FAILED:
          delete creep.motherRoom.memory._dismantle
        case DONE:
          {
            creep.memory._arrive = creep.memory.room
            creep.memory.state = State.ARRIVE
          }
          break
      }
      break
    case State.HARVESTING:
      if (creep.routeProcessor.process()) {
        autoPick(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    case State.REPAIR:
      nativeRoutineHandler(creep, repair(creep))
      break
    case State.BUILD:
      if (creep.buildingRouteProcessor.process()) {
        autoPick(creep) && move.check(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    case State.STORAGE_FILL:
      switch (storageFill(creep)) {
        case NOTHING_DONE:
          autoRepair(creep)
          break
        default:
          if (autoPick(creep) !== SUCCESS) energyHaul(creep)
      }
      break
    case State.STORAGE_DRAW:
      switch (drawStorage(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.IDLE
          break
        case NOTHING_TODO:
        case FAILED:
          energyHaul(creep)
        case NOTHING_DONE:
          autoPick(creep)
          break
      }
      break
    case State.ARRIVE:
      switch (arrive(creep)) {
        case NOTHING_TODO:
        case DONE:
          energyHaul(creep)
          break
      }
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case NOTHING_TODO:
        case DONE:
          creep.memory.state = State.DISMANTLE
          break
      }
      break
    case State.PICK:
      switch (pick(creep)) {
        case FAILED:
        case NOTHING_TODO:
        case DONE:
          dumpResources(creep, State.FILL)
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case FAILED:
        case NOTHING_TODO:
        case DONE:
          dumpResources(creep, State.FILL)
      }
      break
    case State.FILL:
      switch (fill(creep)) {
        case NOTHING_DONE:
          break
        default:
          creep.memory.state = State.IDLE // still need reset
        /*if (creep.store.getUsedCapacity()) dumpResources(creep, State.FILL)
          else if (autoPick(creep) !== SUCCESS) {
            if (!haulCurrentRoom(creep)) creep.memory.state = State.IDLE
          }*/
      }
      break
    default:
      creep.memory.state = State.IDLE
  }
}, 'roleHarvester')
