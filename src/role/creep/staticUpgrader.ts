import {
  DONE,
  NOTHING_DONE,
  FAILED,
  NO_RESOURCE,
  SUCCESS,
  NOTHING_TODO,
} from 'constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import draw from 'routine/haul/draw'
import ProfilerPlus from 'utils/ProfilerPlus'

export interface StaticUpgrader extends Creep {
  memory: StaticUpgraderMemory
}

interface StaticUpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default ProfilerPlus.instance.overrideFn(function staticUpgrader(
  creep: StaticUpgrader,
) {
  switch (creep.memory.state) {
    case State.UPGRADE:
      switch (upgrade(creep, true)) {
        case NO_RESOURCE:
        case FAILED:
          const linkId = creep.room.links.controller?.id
          if (linkId) {
            creep.memory.state = State.DRAW
            creep.memory._draw = linkId
            draw(creep)
          }
          break
        case NOTHING_DONE:
          autoRepair(creep)
          break
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case DONE:
        case SUCCESS:
        case NOTHING_TODO:
        case FAILED:
          creep.memory.state = State.UPGRADE
          upgrade(creep, true)
          break
      }
      break
    default:
      creep.memory.state = State.UPGRADE
  }
},
'roleStaticUpgrader')
