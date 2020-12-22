import arrive, { ArriveCreep } from 'routine/arrive'
import { DONE, NOTHING_TODO } from 'constants/response'
import { getWall } from 'utils/selectFromPos'
import dismantle from 'routine/work/dismantle'
import scorePlanner, { advanceRoomToCollector } from 'planner/score'

function tryArriveToDigDestination(creep: ArriveCreep) {
  creep.memory._arrive = creep.motherRoom.memory._dig
  if (creep.memory._arrive) creep.memory.state = State.ARRIVE
}

interface ScoreDigger extends ArriveCreep {
  cache: ScoreDiggerCache
}

interface ScoreDiggerCache extends CreepCache {
  dismantle?: Id<StructureWall>
}

export default function scoreDigger(creep: ScoreDigger) {
  switch (creep.memory.state) {
    case State.INIT:
      tryArriveToDigDestination(creep)
      break
    case State.IDLE:
      const location = creep.room.name
      console.log(location, creep.motherRoom.memory._dig)
      if (location !== creep.motherRoom.memory._dig)
        tryArriveToDigDestination(creep)
      else creep.memory.state = State.DISMANTLE
      break
    case State.ARRIVE:
      switch (arrive(creep)) {
        case DONE:
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.DISMANTLE:
      let wall: StructureWall | '' | null | undefined =
        creep.cache.dismantle && Game.getObjectById(creep.cache.dismantle)
      if (!wall) {
        let plan = creep.room.memory._scorePlan
        if (!plan) {
          scorePlanner(creep.room, creep.motherRoom.memory)
          plan = creep.room.memory._scorePlan
        }
        wall =
          plan &&
          plan
            .split('')
            .map((c) => getWall(creep.room, c.charCodeAt(0)))
            .find((w) => !!w)
      }
      if (wall) dismantle(creep, wall)
      else {
        creep.memory.state = State.IDLE
        advanceRoomToCollector(creep.room, creep.motherRoom.memory)
      }
      break
    default:
      creep.memory.state = State.INIT
  }
}
