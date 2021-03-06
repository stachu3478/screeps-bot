import { DONE, NOTHING_TODO } from 'constants/response'
import arrive from 'routine/arrive'

export interface Scout extends Creep {
  memory: ScoutMemory
}

interface ScoutMemory extends CreepMemory {
  _arrive?: string
}

export default function run(creep: Scout) {
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.SCOUT
      creep.motherRoom.cache.scoutsWorking++
      break
    case State.SCOUT:
      creep.memory._arrive = creep.motherRoom.pathScanner.scanTarget
      creep.motherRoom.cache.scoutsWorking++
      switch (arrive(creep)) {
        case NOTHING_TODO:
        case DONE:
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.IDLE:
      const target = creep.motherRoom.pathScanner.scanTarget
      if (target) {
        creep.memory._arrive = target
        if (arrive(creep) !== NOTHING_TODO) {
          creep.memory.state = State.SCOUT
          creep.motherRoom.cache.scoutsWorking++
        }
      }
      break
    default:
      creep.memory.state = State.INIT
  }
}
