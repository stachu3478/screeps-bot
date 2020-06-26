import { DONE, NOTHING_TODO, SUCCESS, NOTHING_DONE, FAILED } from 'constants/response'
import arrive from 'routine/arrive'
import attack from 'routine/military/attack'
import heal from 'routine/military/heal';
import recycle from 'routine/recycle';

export interface Commander extends Creep {
  memory: CommanderMemory
}

interface CommanderMemory extends CreepMemory {
  _arrive?: string
  _prev_hits?: number
  _attack?: Id<Creep | Structure>
  _heal?: Id<Creep>
  _runTicks?: number
  [Keys.toughHitsThreshold]?: number
  [Keys.attackHitsThreshold]?: number
}

function getHitThreshold(creep: Creep, type: BodyPartConstant) {
  return creep.body.reverse().findIndex(part => part.type === type) * 100
}

const hasPart = (type: BodyPartConstant, property: Keys) => (creep: Commander) => {
  const memory = creep.memory
  const threshold = memory[property]
  if (threshold)
    return creep.hits > threshold
  return creep.hits > (memory[property] = getHitThreshold(creep, type))
}
export const hasToughPart = hasPart(TOUGH, Keys.toughHitsThreshold)
const hasAttackPart = hasPart(ATTACK, Keys.attackHitsThreshold)

export default function commander(creep: Commander) {
  const prevHits = creep.memory._prev_hits || creep.hits - 1
  creep.memory._prev_hits = creep.hits
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.ARRIVE_HOSTILE
      creep.memory._arrive = creep.motherRoom.memory._attack
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case NOTHING_TODO: creep.suicide()
        case DONE: delete Memory.creeps[creep.name]
      }
      break
    case State.ARRIVE_HOSTILE:
      switch (arrive(creep)) {
        case DONE: creep.memory.state = State.ATTACKING; break
        case NOTHING_TODO: creep.memory.state = State.FALL_BACK; break
        default:
          if (hasToughPart(creep)) creep.memory.state = State.FALL_BACK
          heal(creep)
      }
      break
    case State.ATTACKING:
      switch (attack(creep)) {
        case NOTHING_DONE: {
          heal(creep)
        }; break
        case FAILED: {
          creep.memory.state = State.FALL_BACK
          creep.memory._arrive = creep.memory.room
          arrive(creep)
        } break
        case NOTHING_TODO: {
          creep.memory.state = State.RECYCLE
          delete creep.motherRoom.memory._attack
        }; break
      }
      break
    case State.FALL_BACK:
      const runTicks = creep.memory._runTicks || 0
      if (runTicks > 0 || creep.hits < prevHits || !hasAttackPart(creep)) {
        if (creep.hits < prevHits || !hasAttackPart(creep)) creep.memory._runTicks = 5
        switch (arrive(creep)) {
          case SUCCESS: case NOTHING_TODO:
            const attackTarget = creep.motherRoom.memory._attack
            if (attackTarget) {
              if (hasToughPart(creep)) {
                creep.memory._arrive = attackTarget
                creep.memory.state = State.ARRIVE_HOSTILE
              }
              creep.heal(creep)
              break
            }
          default: creep.heal(creep)
        }
      } else if (hasToughPart(creep)) {
        creep.memory._arrive = creep.motherRoom.memory._attack
        if (creep.memory._arrive) creep.memory.state = State.ARRIVE_HOSTILE
        else creep.memory.state = State.RECYCLE
      } else creep.heal(creep)
      break
    default:
      creep.memory.state = State.INIT
  }
}
