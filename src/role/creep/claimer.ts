import { DONE, NOTHING_TODO } from 'constants/response'
import selfDestruct from 'routine/selfDestruct'
import arrive from 'routine/arrive'
import claim from 'routine/military/claim'

export interface Claimer extends Creep {
  memory: ClaimerMemory
}

interface ClaimerMemory extends CreepMemory {
  role: Role.CLAIMER
  _arrive?: string
}

function arriveToClaimedRoom(creep: Claimer) {
  creep.memory.state = State.ARRIVE
  creep.memory._arrive = Memory.rooms[creep.memory.room][RoomMemoryKeys.claim]
}

export default function run(creep: Claimer) {
  switch (creep.memory.state) {
    case State.ARRIVE:
      switch (arrive(creep)) {
        case DONE:
          creep.memory.state = State.CLAIMING
          break
      }
      break
    case State.CLAIMING:
      if (
        Memory.rooms[creep.memory.room][RoomMemoryKeys.claim] !==
        creep.room.name
      ) {
        arriveToClaimedRoom(creep)
        break
      }
      switch (claim(creep)) {
        case NOTHING_TODO:
          arriveToClaimedRoom(creep)
          break
        case DONE:
          delete Memory.rooms[creep.memory.room][RoomMemoryKeys.claim]
          creep.memory.state = State.DESTRUCT
          global.Cache.ownedRooms = (global.Cache.ownedRooms || 0) + 1
          break
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
      arriveToClaimedRoom(creep)
    }
  }
}
