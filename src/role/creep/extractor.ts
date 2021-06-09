import mineralFill from 'routine/haul/mineralFill'
import {
  SUCCESS,
  DONE,
  NOTHING_TODO,
  NO_RESOURCE,
  NOTHING_DONE,
  ACCEPTABLE,
} from 'constants/response'
import recycle from 'routine/recycle'
import extract from 'routine/work/extract'
import autoPickResource from 'routine/haul/autoPickResource'
import collectGarbage from 'utils/collectGarbage'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function extractor(
  creep: Creep,
) {
  const mineral = creep.motherRoom.mineral
  const resourceType = mineral ? mineral.mineralType : 'U'
  switch (creep.memory.state) {
    case State.HARVESTING:
      switch (extract(creep)) {
        case DONE:
          creep.memory.state = State.STORAGE_FILL
          break
        case NOTHING_TODO:
          if (creep.store[resourceType]) creep.memory.state = State.STORAGE_FILL
          else creep.memory.state = State.RECYCLE
          break
        case NOTHING_DONE:
          autoPickResource(creep, resourceType)
      }
      break
    case State.STORAGE_FILL:
      switch (mineralFill(creep, resourceType)) {
        case SUCCESS:
        case NO_RESOURCE: {
          if (autoPickResource(creep, resourceType) in ACCEPTABLE)
            creep.memory.state = State.STORAGE_FILL
          else creep.memory.state = State.HARVESTING
        }
      }
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case DONE:
          collectGarbage(creep.name)
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
},
'roleExtractor')
