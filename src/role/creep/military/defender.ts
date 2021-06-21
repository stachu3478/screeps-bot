import { DONE, NOTHING_TODO } from 'constants/response'
import arrive from 'routine/arrive'
import rangedAttack from 'routine/military/rangedAttack'
import { findTargetCreeps } from 'routine/military/shared'
import move from 'utils/path'

export interface Defender extends Creep {
  memory: DefenderMemory
  cache: DefenderCache
}

interface DefenderMemory extends CreepMemory {
  role: Role.DEFENDER
  _arrive?: string
}

interface DefenderCache extends CreepCache {
  attack?: Id<Creep>
  heal?: string
}

function tryArriveToAttackDestination(creep: Defender) {
  creep.memory._arrive = creep.motherRoom.outpostDefense.targetRoom
  if (creep.memory._arrive) {
    creep.memory.state = State.ARRIVE_HOSTILE
  }
}

export default function defender(creep: Defender) {
  creep.autoHeal()
  const location = creep.room.name
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      tryArriveToAttackDestination(creep)
      break
    case State.IDLE:
      const hostiles = findTargetCreeps(creep)
      if (hostiles.length) {
        creep.memory.state = State.ATTACKING
      }
      if (location !== creep.motherRoom.memory._rangedAttack) {
        tryArriveToAttackDestination(creep)
      }
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case DONE:
          creep.memory.state = State.ATTACKING
          break
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.ATTACKING:
      switch (rangedAttack(creep)) {
        case NOTHING_TODO:
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.HEAL:
      if (location !== creep.motherRoom.memory._rangedAttack) {
        tryArriveToAttackDestination(creep)
        break
      }
      const toHealName = creep.cache.heal
      let creepToHeal = toHealName && Game.creeps[toHealName]
      if (!creepToHeal) {
        const toBeHealed = creep.room
          .find(FIND_MY_CREEPS)
          .find((c) => c.corpus.healthy)
        if (!toBeHealed) {
          creep.memory.state = State.IDLE
          break
        }
        creepToHeal = toBeHealed
      }
      move.cheap(creep, creepToHeal, false, 1, 1)
      break
    default:
      creep.memory.state = State.INIT
  }
}
