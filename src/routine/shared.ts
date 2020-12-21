import { isWalkable, offsetsByDirection } from 'utils/path'

/**
 * Tries to find best move direction basing on least distance to other room positions
 */
export function pickBestDirectionFrom(
  creep: Creep,
  hostiles: Creep[],
  predicate: (leastSafeDistance: number) => number,
) {
  let bestDirection: DirectionConstant = 1
  let bestPrediction = 0
  for (let i = 1; i <= 8; i++) {
    const direction = i as DirectionConstant
    const offset = offsetsByDirection[direction]
    const newX = creep.pos.x + offset[0]
    const newY = creep.pos.x + offset[1]
    if (!isWalkable(creep.room, newX, newY)) continue
    let worstPrediction = 0
    hostiles.forEach((hostile) => {
      const distanceFrom = hostile.safeRangeXY(newX, newY)
      const prediction = predicate(distanceFrom)
      // const difference = Math.abs(distanceFrom - distance)
      if (prediction < worstPrediction) {
        worstPrediction = prediction
      }
    })
    if (worstPrediction > bestPrediction) {
      bestPrediction = worstPrediction
      bestDirection = direction
    }
  }
  return bestDirection
}
