import { ARRIVE_HOSTILE, ATTACKING, FALL_BACK, RECYCLE, INIT } from '../constants/state'
import { DONE, NOTHING_TODO, SUCCESS, NOTHING_DONE, FAILED } from '../constants/response'
import arrive from 'routine/arrive'
import attack from 'routine/attack'
import heal from 'routine/heal';
import recycle from 'routine/recycle';

export default function commander(creep: Creep) {
  const prevHits = creep.memory._prev_hits || creep.hits - 1
  creep.memory._prev_hits = creep.hits
  switch (creep.memory.state) {
    case INIT: {
      creep.notifyWhenAttacked(false)
      creep.memory.state = ARRIVE_HOSTILE
      creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
    } break;
    case RECYCLE: {
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
    }; break // TODO recycle
    case ARRIVE_HOSTILE: {
      switch (arrive(creep)) {
        case DONE: creep.memory.state = ATTACKING; break
        case NOTHING_TODO: creep.memory.state = FALL_BACK; break
        default: {
          if (creep.getActiveBodyparts(TOUGH) === 0) creep.memory.state = FALL_BACK
          heal(creep)
        }
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
      if (creep.hits < prevHits)
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
        } else if (creep.getActiveBodyparts(TOUGH) > 0) {
          creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
          creep.memory.state = ARRIVE_HOSTILE
        } else creep.heal(creep)
    } break;
    default: {
      creep.memory.state = INIT
    }
  }
}
