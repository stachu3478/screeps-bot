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
import build from 'routine/work/build'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import drawContainer from 'routine/haul/containerDraw'
import drawStorage from 'routine/haul/storageDraw'
import profiler from 'screeps-profiler'
import energyHaul from 'job/energyHaul'
import energyUse from 'job/energyUse'
import Harvester from './harvester.d'
import canUtilizeEnergy from 'job/canUtilizeEnergy'
import draw from 'routine/haul/draw'
import fill from 'routine/haul/fill'
import dumpResources from 'job/dumpResources'
import { haulCurrentRoom } from 'job/resourceHaul'
import pick from 'routine/haul/pick'
import { ensureEmpty } from './shared'
import ResourceRouteProcessor from 'job/resourceRoute/ResourceRouteProcessor'

function nativeRoutineHandler(creep: Harvester, result: number) {
  switch (result) {
    case NO_RESOURCE:
      if (autoPick(creep) !== SUCCESS) energyHaul(creep)
      break
    case NOTHING_TODO:
    case FAILED:
      energyUse(creep)
    case NOTHING_DONE:
      autoRepair(creep)
      break
  }
}

export default profiler.registerFN(function harvester(creep: Harvester) {
  switch (creep.memory.state) {
    case State.IDLE:
      /*if (creep.store[RESOURCE_ENERGY]) energyUse(creep)
      else if (canUtilizeEnergy(creep)) {
        ensureEmpty(creep)
        energyHaul(creep)
      }
      if (creep.memory.state !== State.IDLE) break*/
      if (haulCurrentRoom(creep)) break
      else if (creep.routeProcessor.process()) {
        creep.memory.state = State.HARVESTING
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
      } else {
        if (creep.room.name !== creep.memory.room) {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = State.ARRIVE
        }
        creep.memory.state = State.IDLE
      }
      break
    case State.REPAIR:
      nativeRoutineHandler(creep, repair(creep))
      break
    case State.BUILD:
      nativeRoutineHandler(creep, build(creep))
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
