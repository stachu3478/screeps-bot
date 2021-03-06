import autoRepair from 'routine/work/autoRepair'
import move from 'utils/path/path'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function builder(creep: Creep) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (
        creep.buildingRouteProcessor.process() &&
        creep.buildingRouteProcessor.found
      ) {
        creep.memory.state = State.BUILD
      } else if (
        creep.repairRouteProcessor.process() &&
        creep.repairRouteProcessor.found
      ) {
        creep.memory.state = State.REPAIR
      } else autoRepair(creep)
      break
    case State.REPAIR:
      if (creep.repairRouteProcessor.process()) {
        move.check(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    case State.BUILD:
      if (creep.buildingRouteProcessor.process()) {
        move.check(creep) && autoRepair(creep)
      } else creep.memory.state = State.IDLE
      break
    default:
      creep.memory.state = State.IDLE
  }
}, 'roleBuilder')
