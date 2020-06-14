import State from 'constants/state'
import { DONE, FAILED } from 'constants/response'
import exit from 'routine/exit'
import scout from 'routine/military/scout'

export interface Scout extends Creep {
  memory: ScoutMemory
}

interface ScoutMemory extends CreepMemory {
  _exit: string
}

export default function run(creep: Scout) {
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.EXIT
      break;
    case State.EXIT:
      switch (exit(creep)) {
        case DONE: creep.memory.state = State.SCOUT; break
      }
      break;
    case State.SCOUT:
      switch (scout(creep)) {
        case FAILED: creep.memory.state = State.EXIT; break
        case DONE:
          Memory.rooms[creep.memory.room]._claim = creep.room.name
          creep.memory.state = State.EXIT
          break
      }
      break;
    default:
      creep.memory.state = State.INIT
  }
}
