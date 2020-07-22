import { DONE, NOTHING_TODO } from 'constants/response'
import recycle from 'routine/recycle';
import fight from 'routine/military/fight';
import collectGarbage from 'utils/collectGarbage';

export interface Fighter extends Creep {
  memory: FighterMemory
}

interface FighterMemory extends CreepMemory { }

export default function fighter(creep: Fighter, enemy?: Creep, keepDistance?: boolean) {
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.FIGHT
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case DONE: collectGarbage(creep.name)
      }
      break
    case State.FIGHT:
      switch (fight(creep, enemy, keepDistance)) {
        case NOTHING_TODO: creep.memory.state = State.RECYCLE; break
      }
      break
    default:
      creep.memory.state = State.INIT
  }
}
