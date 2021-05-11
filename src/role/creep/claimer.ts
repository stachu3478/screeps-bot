import { DONE, NOTHING_TODO } from 'constants/response'
import selfDestruct from 'routine/selfDestruct'
import arrive from 'routine/arrive'
import claim from 'routine/military/claim'
import ClaimPlanner from 'planner/ClaimPlanner'

export interface Claimer extends Creep {
  memory: ClaimerMemory
}

interface ClaimerMemory extends CreepMemory {
  role: Role.CLAIMER
  _arrive?: string
}

export default function run(creep: Claimer) {
  const target = ClaimPlanner.instance.target
  if (!target) return
  switch (creep.memory.state) {
    case State.CLAIMING:
      if (target.target !== creep.room.name) {
        creep.memory._arrive = target.target
        arrive(creep)
      } else if (claim(creep) === DONE) {
        creep.memory.state = State.DESTRUCT
        global.Cache.ownedRooms = (global.Cache.ownedRooms || 0) + 1
      }
      break
    case State.DESTRUCT:
      switch (selfDestruct(creep)) {
        case NOTHING_TODO:
        case DONE:
          creep.suicide()
          break
      }
      break
    default: {
      creep.memory.state = State.CLAIMING
    }
  }
}
