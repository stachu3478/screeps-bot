import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'
import { findTarget } from './shared'

interface AttackCreep extends Creep {
  cache: AttackCache
}

interface AttackCache extends CreepCache {
  attack?: Id<Creep | Structure>
}

export default function attack(creep: AttackCreep) {
  const cache = creep.cache
  let target: Creep | Structure | null = Game.getObjectById(cache.attack || '')
  if (!creep.corpus.hasActive(TOUGH)) return FAILED
  if (!target) {
    const newTarget = findTarget(creep)
    if (!newTarget) return NOTHING_TODO
    cache.attack = newTarget.id
    target = newTarget
  }
  if (!creep.pos.isNearTo(target)) {
    creep.moveTo(target, { maxRooms: 1 })
    return NOTHING_DONE
  }
  if (creep.corpus.healthy) {
    if (creep.attack(target) !== OK) return FAILED
  } else creep.heal(creep)
  return SUCCESS
}
