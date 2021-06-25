import {
  DONE,
  NOTHING_DONE,
  NOTHING_TODO,
  FAILED,
  SUCCESS,
} from 'constants/response'
import storageFill from 'routine/haul/storageFill'
import autoRepair from 'routine/work/autoRepair'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import drawStorage from 'routine/haul/storageDraw'
import energyHaul from 'job/energyHaul'
import Harvester from './harvester.d'
import draw from 'routine/haul/draw'
import fill from 'routine/haul/fill'
import dumpResources from 'job/dumpResources'
import { haulCurrentRoom } from 'job/resourceHaul'
import pick from 'routine/haul/pick'
import move from 'utils/path/path'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function harvester(
  creep: Harvester,
) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (haulCurrentRoom(creep)) break
      else if (creep.routeProcessor.process()) {
        if (creep.routeProcessor.isJobFound())
          creep.memory.state = State.HARVESTING
      } else if (creep.motherRoom.buildingRouter.found) {
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
          creep.memory._arrive = creep.memory.room
          creep.memory.state = State.ARRIVE
          break
      }
      break
    case State.HARVESTING:
      const res = creep.routeProcessor.process()
      if (res) {
        creep.say('doin')
        move.check(creep) && autoRepair(creep)
      } else {
        creep.say('idling')
        creep.memory.state = State.IDLE
      }
      break
    case State.BUILD:
      if (
        !creep.store[RESOURCE_ENERGY] /* idk */ &&
        creep.routeProcessor.process() &&
        creep.routeProcessor.isJobFound()
      ) {
        creep.memory.state = State.HARVESTING
        break
      }
      if (creep.buildingRouteProcessor.process()) {
        move.check(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    case State.STORAGE_FILL:
      switch (storageFill(creep)) {
        case NOTHING_DONE:
          autoRepair(creep)
          break
        default:
          energyHaul(creep)
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
      }
      break
    default:
      creep.memory.state = State.IDLE
  }
},
'roleHarvester')
