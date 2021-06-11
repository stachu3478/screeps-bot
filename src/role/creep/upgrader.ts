import {
  DONE,
  FAILED,
  NO_RESOURCE,
  SUCCESS,
  NOTHING_TODO,
} from 'constants/response'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'
import storageDraw from 'routine/haul/storageDraw'
import drawContainer from 'routine/haul/containerDraw'
import draw from 'routine/haul/draw'
import { energyToUpgraderRepairThreshold } from 'config/storage'
import ProfilerPlus from 'utils/ProfilerPlus'

export interface UpgraderCreep extends Creep {
  memory: UpgraderMemory
}

interface UpgraderMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
}

export default ProfilerPlus.instance.overrideFn(function upgrader(
  creep: UpgraderCreep,
) {
  switch (creep.memory.state) {
    case State.HARVESTING:
      switch (drawContainer(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.UPGRADE
          break
        case NOTHING_TODO:
          creep.memory.state = State.STORAGE_DRAW
          break
      }
      break
    case State.UPGRADE:
      switch (upgrade(creep)) {
        case NO_RESOURCE:
        case FAILED:
          const linkId = creep.room.links.controller?.id
          if (linkId) {
            creep.memory.state = State.DRAW
            creep.memory._draw = linkId
            draw(creep)
            break
          }
          creep.memory.state = State.HARVESTING
          break
        default:
          if (
            creep.room.store(RESOURCE_ENERGY) >=
              energyToUpgraderRepairThreshold ||
            !creep.room.storage
          )
            autoRepair(creep)
          break
      }
      break
    case State.STORAGE_DRAW:
      switch (storageDraw(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.UPGRADE
          break
        case NOTHING_TODO:
        case FAILED:
          creep.memory.state = State.HARVESTING
          break
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.UPGRADE
          break
        case NOTHING_TODO:
        case FAILED:
          creep.memory.state = State.HARVESTING
          break
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
},
'roleUpgrader')
