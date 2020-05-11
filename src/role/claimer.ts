import { ARRIVE, CLAIMING, DESTRUCT } from '../constants/state'
import { DONE, NOTHING_TODO } from '../constants/response'
import selfDestruct from '../routine/selfDestruct'
import arrive from 'routine/arrive'
import claim from 'routine/military/claim';

export interface Claimer extends Creep {
  memory: ClaimerMemory
}

interface ClaimerMemory extends CreepMemory {
  role: 5
  _arrive?: string
}

export default function run(creep: Claimer) {
  switch (creep.memory.state) {
    case ARRIVE: {
      switch (arrive(creep)) {
        case DONE: creep.memory.state = CLAIMING; break
      }
    } break;
    case CLAIMING: {
      switch (claim(creep)) {
        case NOTHING_TODO: {
          creep.memory.state = ARRIVE
          creep.memory._arrive = Memory.rooms[creep.memory.room]._claim
        }; break
        case DONE: {
          delete Memory.rooms[creep.memory.room]._claim
          creep.memory.state = DESTRUCT
        }; break
      }
    } break;
    case DESTRUCT: {
      switch (selfDestruct(creep)) {
        case NOTHING_TODO: case DONE: {
          creep.suicide()
        }; break
      }
    }
    default: {
      creep.memory.state = ARRIVE
      creep.memory._arrive = Memory.rooms[creep.memory.room]._claim
    }
  }
}
