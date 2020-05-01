import { EXIT, INIT, SCOUT } from '../constants/state'
import { DONE, FAILED } from '../constants/response'
import exit from 'routine/exit'
import scout from 'routine/scout'

export default function run(creep: Creep) {
  switch (creep.memory.state) {
    case INIT: {
      creep.notifyWhenAttacked(false)
      creep.memory.state = EXIT
    } break;
    case EXIT: {
      switch (exit(creep)) {
        case DONE: creep.memory.state = SCOUT; break
      }
    } break;
    case SCOUT: {
      switch (scout(creep)) {
        case FAILED: creep.memory.state = EXIT; break
        case DONE: {
          Memory.rooms[creep.memory.room]._claim = creep.room.name
          creep.memory.state = EXIT
        }; break
      }
    } break;
    default: {
      creep.memory.state = INIT
    }
  }
}
