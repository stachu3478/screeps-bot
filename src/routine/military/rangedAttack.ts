import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'
import { findTarget } from './shared'
import { pickBestDirectionFrom } from '../shared'
import move from 'utils/path'

interface AttackCreep extends Creep {
  cache: AttackCache
}

interface AttackCache extends CreepCache {
  attack?: Id<Creep | Structure>
}

export class ProtectedArea {
  private protector: Creep
  private protect: _HasRoomPosition
  private protectsSelf: boolean

  constructor(
    protector: Creep,
    protect: _HasRoomPosition = ProtectedArea.findForProtection(protector),
  ) {
    this.protector = protector
    this.protect = protect
    this.protectsSelf = this.protector === this.protect
  }

  canBypass(target: _HasRoomPosition) {
    return this.protect.pos.getRangeTo(target) <= this.allowedRange
  }

  private get allowedRange() {
    if (this.protectsSelf) return 50
    return Math.max(this.protector.pos.getRangeTo(this.protect), 5)
  }

  static findForProtection(protector: Creep) {
    return (
      protector.room.find(FIND_FLAGS, {
        filter: (f) => f.name.match(/^[Pp]rotect/),
      })[0] || protector
    )
  }
}

export function handleCachedTarget(
  creep: AttackCreep,
  protectedArea = new ProtectedArea(creep),
) {
  const cache = creep.cache
  let target: Creep | Structure | null = Game.getObjectById(cache.attack || '')
  if (!target) {
    const newTarget = findTarget(creep, true, (e) => protectedArea.canBypass(e))
    if (!newTarget) return
    cache.attack = newTarget.id
    target = newTarget
  } else if (
    !protectedArea.canBypass(target) ||
    !!(target as Structure).structureType
  ) {
    const newTarget = findTarget(
      creep,
      true,
      (e) => !(e as Structure).structureType && protectedArea.canBypass(e),
    )
    if (newTarget) {
      cache.attack = newTarget.id
      target = newTarget
    }
  }
  return target
}

export default function rangedAttack(creep: AttackCreep) {
  creep.say('💵🔫', true)
  const target = handleCachedTarget(creep)
  if (!target) return NOTHING_TODO
  const hostiles = creep.room
    .find(FIND_HOSTILE_CREEPS)
    .filter((creep) => creep.hasActiveAttackBodyPart)

  const isDanger = (target as Creep).hasActiveAttackBodyPart
  const distances = hostiles.map((hostile) => creep.pos.rangeTo(hostile))
  const leastDistanceFromHostile = Math.min(...distances, Infinity)
  if (creep.hits < creep.hitsMax) {
    creep.heal(creep)
  }
  if (leastDistanceFromHostile < 4) {
    const direction = pickBestDirectionFrom(creep, hostiles, (distance) =>
      Math.abs(Math.floor(distance / 2)),
    )
    move.anywhere(creep, direction)
    creep.cache.attack = (
      hostiles.find(
        (hostile) => creep.pos.rangeTo(hostile) === leastDistanceFromHostile,
      ) || hostiles[0]
    ).id
  } else if (!creep.pos.inRangeTo(target, 3)) {
    creep.moveTo(target)
    creep.rangedMassAttack()
    return NOTHING_DONE
  } else if (!isDanger && !creep.pos.inRangeTo(target, 1)) {
    creep.moveTo(target)
  }
  if (creep.pos.inRangeTo(target, 1)) {
    if (creep.rangedMassAttack() !== OK) return FAILED
  } else if (creep.rangedAttack(target) !== OK) return FAILED
  return SUCCESS
}
