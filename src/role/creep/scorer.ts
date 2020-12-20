import { DONE, NOTHING_TODO, SUCCESS, FAILED } from 'constants/response'
import arrive from 'routine/arrive'
import profiler from 'screeps-profiler'
import fill from 'routine/haul/fill'
import drawStorage from 'routine/haul/storageDraw'
import draw from 'routine/haul/draw'

export interface Scorer extends Creep {
  memory: ScorerMemory
  cache: ScorerCache
}

interface ScorerMemory extends CreepMemory {
  _arrive?: string
}

interface ScorerCache extends CreepCache {
  pick?: Id<Resource>
}

function score(creep: Scorer) {
  const scoreCollector = creep.room.find(10012 as FindConstant)[0] as
    | StructureContainer
    | undefined
  const result = fill(creep, scoreCollector, 'score' as ResourceConstant)
  if (result === FAILED || result === DONE)
    creep.memory.state = State.STORAGE_DRAW
}

function goArrive(creep: Scorer) {
  creep.memory.state = State.ARRIVE
  creep.memory._arrive = creep.motherRoom.memory._score
}

function findScoreContainer(creep: Scorer) {
  return creep.room.find(10011 as FindConstant)[0] as StructureContainer | null
}

export default profiler.registerFN(function scorer(creep: Scorer) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (creep.store.getUsedCapacity()) goArrive(creep)
      else creep.memory.state = State.STORAGE_DRAW
      break
    case State.FILL:
      score(creep)
      break
    case State.STORAGE_DRAW:
      const scoreContainer = findScoreContainer(creep)
      if (scoreContainer) {
        creep.memory.state = State.DRAW
        draw(creep, scoreContainer, 'score' as ResourceConstant)
        break
      }
      switch (drawStorage(creep, 'score' as ResourceConstant)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.IDLE
      }
      break
    case State.DRAW:
      switch (
        draw(creep, findScoreContainer(creep), 'score' as ResourceConstant)
      ) {
        case DONE:
        case SUCCESS:
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
      }
      break
    case State.ARRIVE:
      switch (arrive(creep, false)) {
        case NOTHING_TODO:
        case DONE:
          creep.memory.state = State.FILL
          break
      }
      break
    default:
      creep.memory.state = State.IDLE
  }
}, 'roleHauler')
