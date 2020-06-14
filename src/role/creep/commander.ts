import State from 'constants/state'
import { DONE, NOTHING_TODO, SUCCESS, NOTHING_DONE, FAILED } from 'constants/response'
import arrive from 'routine/arrive'
import attack from 'routine/military/attack'
import heal from 'routine/military/heal';
import recycle from 'routine/recycle';

export interface Commander extends Creep {
  memory: CommanderMemory
}

interface CommanderMemory extends CreepMemory {
  _arrive?: string
  _prev_hits?: number
  _attack?: Id<Creep | Structure>
  _heal?: Id<Creep>
}

export default function commander(creep: Commander) {
  const prevHits = creep.memory._prev_hits || creep.hits - 1
  creep.memory._prev_hits = creep.hits
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.ARRIVE_HOSTILE
      creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case NOTHING_TODO: creep.suicide()
        case DONE: delete Memory.creeps[creep.name]
      }
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case DONE: creep.memory.state = State.ATTACKING; break
        case NOTHING_TODO: creep.memory.state = State.FALL_BACK; break
        default:
          if (creep.getActiveBodyparts(TOUGH) === 0) creep.memory.state = State.FALL_BACK
          heal(creep)
      }
      break
    case State.ATTACKING:
      switch (attack(creep)) {
        case NOTHING_DONE: {
          heal(creep)
        }; break
        case FAILED: {
          creep.memory.state = State.FALL_BACK
          creep.memory._arrive = creep.memory.room
          arrive(creep)
        } break
        case NOTHING_TODO: {
          creep.memory.state = State.RECYCLE
          delete Memory.rooms[creep.memory.room]._attack
        }; break
      }
      break
    case State.FALL_BACK:
      if (creep.hits < prevHits || !creep.getActiveBodyparts(ATTACK))
        switch (arrive(creep)) {
          case SUCCESS: case NOTHING_TODO:
            if (Memory.rooms[creep.memory.room]._attack) {
              if (creep.getActiveBodyparts(TOUGH) > 0) {
                creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
                creep.memory.state = State.ARRIVE_HOSTILE
              }
              creep.heal(creep)
              break
            }
          default: creep.heal(creep)
        } else if (creep.getActiveBodyparts(TOUGH) > 0) {
          creep.memory._arrive = Memory.rooms[creep.memory.room]._attack
          if (creep.memory._arrive) creep.memory.state = State.ARRIVE_HOSTILE
          else creep.memory.state = State.RECYCLE
        } else creep.heal(creep)
      break
    default:
      creep.memory.state = State.INIT
  }
}
