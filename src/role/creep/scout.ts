import { DONE } from 'constants/response'
import arrive from 'routine/arrive'

export interface Scout extends Creep {
  cache: ScoutCache
  memory: ScoutMemory
}

interface ScoutCache extends CreepCache {
  exit: string
}

interface ScoutMemory extends CreepMemory {
  _arrive?: string
}

export default function run(creep: Scout) {
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.SCOUT
      break
    case State.SCOUT:
      creep.memory._arrive = creep.motherRoom.pathScanner.scanTarget
      creep.motherRoom.cache.scoutsWorking++
      switch (arrive(creep)) {
        case DONE:
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.IDLE:
      break
    default:
      creep.memory.state = State.INIT
  }
}
