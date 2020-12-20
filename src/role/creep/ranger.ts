import { DONE, NOTHING_TODO, FAILED } from 'constants/response'
import arrive from 'routine/arrive'
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
  const gettingDamage = creep.hits < prevHits
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      tryArriveToAttackDestination(creep)
      break
    case State.IDLE:
      const hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
      if (hostiles.length) creep.memory.state = State.ATTACKING
      const location = creep.room.name
      if (location !== creep.motherRoom.memory._rangedAttack)
        tryArriveToAttackDestination(creep)
      break
    case State.ARRIVE_HOSTILE:
      if (gettingDamage) {
        creep.memory.state = State.ATTACKING
        break
      }
      switch (arrive(creep)) {
        case DONE:
          creep.memory.state = State.ATTACKING
          break
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
          break
        default:
          if (creep.hits < 4000) creep.memory.state = State.FALL_BACK
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
      if (runTicks > 0 || gettingDamage || creep.hits < 4000) {
        if (gettingDamage || creep.hits < 4000) creep.memory._runTicks = 5
        tryArriveToAttackDestination(creep)
        creep.heal(creep)
      } else if (creep.hits > 4000) {
        tryArriveToAttackDestination(creep)
      } else creep.heal(creep)
      break
    default:
      creep.memory.state = State.INIT
  }
}
