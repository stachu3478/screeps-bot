import { DONE, NOTHING_TODO, FAILED } from 'constants/response'
import arrive from 'routine/arrive'
import { hasRangedAttackPart } from 'routine/military/attack'
import heal from 'routine/military/heal'
import rangedAttack from 'routine/military/rangedAttack'

export interface Ranger extends Creep {
  memory: RangerMemory
  cache: RangerCache
}

interface RangerMemory extends CreepMemory {
  role: Role.COMMANDER
  _arrive?: string
  _prev_hits?: number
  _runTicks?: number
}

interface RangerCache extends CreepCache {
  attack?: Id<Creep | Structure>
  rangedAttackHitsThreshold?: number
}

function tryArriveToAttackDestination(creep: Ranger) {
  creep.memory._arrive = creep.motherRoom.memory._rangedAttack
  if (creep.memory._arrive) creep.memory.state = State.ARRIVE_HOSTILE
}

export default function ranger(creep: Ranger) {
  const prevHits = creep.memory._prev_hits || creep.hits - 1
  creep.memory._prev_hits = creep.hits
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      tryArriveToAttackDestination(creep)
      break
    case State.IDLE:
      const hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
      if (hostiles.length) creep.memory.state = State.ATTACKING
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case DONE:
          creep.memory.state = State.ATTACKING
          break
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
          break
        default:
          if (!hasRangedAttackPart(creep)) creep.memory.state = State.FALL_BACK
          heal(creep)
      }
      break
    case State.ATTACKING:
      switch (rangedAttack(creep)) {
        case FAILED:
          {
            creep.memory.state = State.FALL_BACK
            creep.memory._arrive = creep.memory.room
            arrive(creep)
          }
          break
        case NOTHING_TODO:
          {
            creep.memory.state = State.IDLE
          }
          break
      }
      break
    case State.FALL_BACK:
      const runTicks = creep.memory._runTicks || 0
      if (
        runTicks > 0 ||
        creep.hits < prevHits ||
        !hasRangedAttackPart(creep)
      ) {
        if (creep.hits < prevHits || !hasRangedAttackPart(creep))
          creep.memory._runTicks = 5
        tryArriveToAttackDestination(creep)
        creep.heal(creep)
      } else if (hasRangedAttackPart(creep)) {
        tryArriveToAttackDestination(creep)
      } else creep.heal(creep)
      break
    default:
      creep.memory.state = State.INIT
  }
}
