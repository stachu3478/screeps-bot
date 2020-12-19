import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'
import { findTarget } from './shared'
import { offsetsByDirection, isWalkable } from 'utils/path'

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

export default function rangedAttack(creep: AttackCreep) {
  const cache = creep.cache
  let target: Creep | Structure | null = Game.getObjectById(cache.attack || '')
  if (!target) {
    const newTarget = findTarget(creep, true)
    if (!newTarget) return NOTHING_TODO
    cache.attack = newTarget.id
    target = newTarget
  }
  const hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
  const leastDistanceFromHostile = Math.min(
    ...hostiles.map((hostile) => creep.pos.rangeTo(hostile)),
  )
  if (creep.hits < creep.hitsMax) {
    creep.heal(creep)
  }
  if (leastDistanceFromHostile < 4) {
    const direction = pickDistancedPosFrom(
      creep,
      hostiles.map((hostile) => hostile.pos),
    )
    creep.move(direction)
    console.log('Moved by predicted offset')
  } else if (!creep.pos.inRangeTo(target, 3)) {
    creep.moveTo(target)
    console.log('Moved to target')
    return NOTHING_DONE
  }
  if (creep.rangedAttack(target) !== OK) return FAILED
  return SUCCESS
}
