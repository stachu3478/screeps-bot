import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import profiler from 'screeps-profiler'
import move from 'utils/path'

export default profiler.registerFN(function builder(creep: Creep) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (creep.buildingRouteProcessor.process()) {
        creep.memory.state = State.BUILD
      }
      break
    case State.HARVESTING:
      if (creep.routeProcessor.process()) {
        autoPick(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    /*case State.REPAIR: TODO
      nativeRoutineHandler(creep, repair(creep))
      break*/
    case State.BUILD:
      if (creep.buildingRouteProcessor.process()) {
        autoPick(creep) && move.check(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    default:
      creep.memory.state = State.IDLE
  }
}, 'roleBuilder')
