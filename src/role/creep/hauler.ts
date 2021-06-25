import { DONE, NOTHING_DONE, NOTHING_TODO } from 'constants/response'
import arrive from 'routine/arrive'
import recycle from 'routine/recycle'
import Hauler from './hauler.d'
import pick from 'routine/haul/pick'
import resourceHaul from 'job/resourceHaul'
import fill from 'routine/haul/fill'
import draw from 'routine/haul/draw'
import dumpResources from 'job/dumpResources'
import collectGarbage from 'utils/collectGarbage'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function hauler(creep: Hauler) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (creep.store.getUsedCapacity()) creep.memory.state = State.STORAGE_FILL
      else resourceHaul(creep)
      break
    case State.PICK:
      switch (pick(creep)) {
        case NOTHING_TODO:
        case DONE:
          resourceHaul(creep)
      }
      break
    case State.RECYCLE:
      const haulTarget = creep.motherRoom.memory._haul
      if (haulTarget) {
        creep.memory.state = State.IDLE
      } else if (recycle(creep) === DONE) {
        collectGarbage(creep.name)
      }
      break
    case State.DRAW:
      switch (draw(creep)) {
        case NOTHING_TODO:
        case DONE:
          resourceHaul(creep)
      }
      break
    case State.STORAGE_FILL:
      switch (fill(creep)) {
        case NOTHING_DONE:
          break
        default:
          if (creep.store.getUsedCapacity())
            dumpResources(creep, State.STORAGE_FILL)
          else resourceHaul(creep)
      }
      break
    case State.ARRIVE:
      switch (arrive(creep, true)) {
        case NOTHING_TODO:
        case DONE:
          resourceHaul(creep)
          break
      }
      break
    case State.ARRIVE_BACK:
      if (creep.motherRoom.name === creep.room.name) {
        dumpResources(creep, State.STORAGE_FILL)
      } else {
        creep.moveToRoom(creep.memory.room)
      }
      break
    default:
      resourceHaul(creep)
  }
}, 'roleHauler')
