import { RECYCLE, INIT, FIGHT } from '../constants/state'
import { DONE, NOTHING_TODO } from '../constants/response'
import recycle from 'routine/recycle';
import fight from 'routine/military/fight';

export interface Fighter extends Creep {
  memory: FighterMemory
}

interface FighterMemory extends CreepMemory { }

export default function fighter(creep: Fighter, enemy?: Creep) {
  switch (creep.memory.state) {
    case INIT: {
      creep.notifyWhenAttacked(false)
      creep.memory.state = FIGHT
    } break;
    case RECYCLE: {
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
    }; break
    case FIGHT: {
      switch (fight(creep, enemy)) {
        case NOTHING_TODO: creep.memory.state = RECYCLE; break
      }
    } break;
    default: {
      creep.memory.state = INIT
    }
  }
}
