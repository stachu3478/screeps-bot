import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'
import { findTarget } from './shared'
import { offsetsByDirection, isWalkable } from 'utils/path'
import _ from 'lodash'

interface AttackCreep extends Creep {
  cache: AttackCache
}

interface AttackCache extends CreepCache {
  attack?: Id<Creep | Structure>
}

/**
 * Tries to find best move direction to keep
 */
export function pickDistancedPosFrom(
  creep: Creep,
  posns: RoomPosition[],
  distance = 3,
) {
  let bestDirection: DirectionConstant = 1
  let bestDistanceDifference = Infinity
  for (let i = 1; i <= 8; i++) {
    const direction = i as DirectionConstant
    const offset = offsetsByDirection[direction]
    const newX = creep.pos.x + offset[0]
    const newY = creep.pos.x + offset[1]
    if (!isWalkable(creep.room, newX, newY)) continue
    let worstDistanceDifference = 0
    posns.forEach((pos) => {
      const distanceFrom = pos.rangeXY(newX, newY)
      const difference = Math.abs(distanceFrom - distance)
      if (difference > worstDistanceDifference) {
        worstDistanceDifference = difference
      }
    })
    if (worstDistanceDifference < bestDistanceDifference) {
      bestDistanceDifference = worstDistanceDifference
      bestDirection = direction
    }
  }
  return bestDirection
}

const attackBodyParts = { [ATTACK]: 1, [RANGED_ATTACK]: 1 }
const findActiveAttackBodyPart = (hp: number, body: Creep['body']) => {
  const size = body.length
  return !_.isUndefined(
    body.find(
      (bodypart, i) =>
        bodypart.type in attackBodyParts && hp - (size - i) * 100 > -100,
    ),
  )
}
export default function rangedAttack(creep: AttackCreep) {
  const cache = creep.cache
  let target: Creep | Structure | null = Game.getObjectById(cache.attack || '')
  if (!target) {
    const newTarget = findTarget(creep, true)
    if (!newTarget) return NOTHING_TODO
    cache.attack = newTarget.id
    target = newTarget
  }
  const hostiles = creep.room
    .find(FIND_HOSTILE_CREEPS)
    .filter((creep) => findActiveAttackBodyPart(creep.hits, creep.body))

  const isDanger =
    (target as Creep).body &&
    findActiveAttackBodyPart((target as Creep).hits, (target as Creep).body)
  const distances = hostiles.map((hostile) => creep.pos.rangeTo(hostile))
  console.log(distances)
  const leastDistanceFromHostile = Math.min(...distances)
  if (creep.hits < creep.hitsMax) {
    creep.heal(creep)
  }
  if (leastDistanceFromHostile < 4) {
    const direction = pickDistancedPosFrom(
      creep,
      hostiles.map((hostile) => hostile.pos),
    )
    creep.move(direction)
    creep.cache.attack = (
      hostiles.find(
        (hostile) => creep.pos.rangeTo(hostile) === leastDistanceFromHostile,
      ) || hostiles[0]
    ).id
    console.log('Moved by predicted offset')
  } else if (!creep.pos.inRangeTo(target, 3)) {
    creep.moveTo(target)
    console.log('Moved to target')
    return NOTHING_DONE
  } else if (!isDanger && !creep.pos.inRangeTo(target, 1)) {
    creep.moveTo(target)
  }
  if (creep.pos.inRangeTo(target, 1)) {
    if (creep.rangedMassAttack() !== OK) return FAILED
  } else if (creep.rangedAttack(target) !== OK) return FAILED
  return SUCCESS
}
