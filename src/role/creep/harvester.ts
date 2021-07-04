import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED } from 'constants/response'
import autoRepair from 'routine/work/autoRepair'
import dismantle from 'routine/work/dismantle'
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
    case State.PICK:
      switch (pick(creep)) {
        case FAILED:
        case NOTHING_TODO:
        case DONE:
          if (!haulCurrentRoom(creep)) {
            dumpResources(creep, State.FILL)
          }
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case FAILED:
        case NOTHING_TODO:
        case DONE:
          if (!haulCurrentRoom(creep)) {
            dumpResources(creep, State.FILL)
          }
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
