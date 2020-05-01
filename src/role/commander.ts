import { ARRIVE, ARRIVE_HOSTILE, ATTACKING, FALL_BACK, RECYCLE } from '../constants/state'
import { DONE, NOTHING_TODO, SUCCESS, NOTHING_DONE, FAILED } from '../constants/response'
import arrive from 'routine/arrive'
import attack from 'routine/attack'
import heal from 'routine/heal';

export default function commander(creep: Creep) {
  switch (creep.memory.state) {
    case RECYCLE: { }; break // TODO recycle
    case ARRIVE: {
      switch (arrive(creep)) {
        case SUCCESS: {
          creep.memory.state = RECYCLE
        } break
      }
    } break;
    case ARRIVE_HOSTILE: {
      switch (arrive(creep)) {
        case DONE: creep.memory.state = ATTACKING; break
        default: heal(creep)
      }
    } break;
    case ATTACKING: {
      switch (attack(creep)) {
        case NOTHING_DONE: {
          heal(creep)
        }; break
        case FAILED: {
          creep.memory.state = FALL_BACK
          creep.memory._arrive = creep.memory.room
          arrive(creep)
        } break
        case NOTHING_TODO: {
          creep.memory.state = FALL_BACK
          creep.memory._arrive = creep.memory.room
          delete Memory.rooms[creep.memory.room]._attack
        }; break
      }
    } break;
    case FALL_BACK: {
      switch (arrive(creep)) {
        case SUCCESS: case NOTHING_TODO: {
          if (Memory.rooms[creep.memory.room]._attack) {
            if (creep.getActiveBodyparts(TOUGH) > 0) {
              creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
              creep.memory.state = ARRIVE_HOSTILE
            } else creep.heal(creep)
          }
        } break
        default: creep.heal(creep)
      }
    } break;
    default: {
      creep.memory.state = ARRIVE_HOSTILE
      creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
    }
  }
}
