import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'
import { findTarget } from './shared'

interface AttackCreep extends Creep {
  cache: AttackCache
}

interface AttackCache extends CreepCache {
  attack?: Id<Creep | Structure>
  toughHitsThreshold?: number
  attackHitsThreshold?: number
  rangedAttackHitsThreshold?: number
}

function getHitThreshold(creep: Creep, type: BodyPartConstant) {
  return creep.body.reverse().findIndex((part) => part.type === type) * 100
}

const hasPart = (
  type: BodyPartConstant,
  property:
    | 'toughHitsThreshold'
    | 'attackHitsThreshold'
    | 'rangedAttackHitsThreshold',
) => (creep: AttackCreep) => {
  const cache = creep.cache
  const threshold = cache[property]
  if (threshold) return creep.hits > threshold
  return creep.hits > (cache[property] = getHitThreshold(creep, type))
}
export const hasToughPart = hasPart(TOUGH, 'toughHitsThreshold')
export const hasAttackPart = hasPart(ATTACK, 'attackHitsThreshold')
export const hasRangedAttackPart = hasPart(
  RANGED_ATTACK,
  'rangedAttackHitsThreshold',
)

export default function attack(creep: AttackCreep) {
  const cache = creep.cache
  let target: Creep | Structure | null = Game.getObjectById(cache.attack || '')
  if (!hasToughPart(creep)) return FAILED
  if (!target) {
    const newTarget = findTarget(creep)
    if (!newTarget) return NOTHING_TODO
    cache.attack = newTarget.id
    target = newTarget
  }
  if (!creep.pos.isNearTo(target)) {
    creep.moveTo(target)
    return NOTHING_DONE
  }
  if (creep.hits === creep.hitsMax) {
    if (creep.attack(target) !== OK) return FAILED
  } else creep.heal(creep)
  return SUCCESS
}
