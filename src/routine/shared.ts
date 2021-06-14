import { ALL_DIRECTIONS } from 'constants/support'

/**
 * Tries to find best move direction basing on least distance to other room positions
 */
export function pickBestDirectionFrom(
  creep: Creep,
  hostiles: Creep[],
  predicate: (leastSafeDistance: number) => number,
) {
  let bestDirection = ALL_DIRECTIONS[0]
  let bestPrediction = -Infinity
  creep.pos.eachOffset((offsetPos, direction) => {
    if (!offsetPos.walkable) {
      return
    }
    let worstPrediction = Infinity
    hostiles.forEach((hostile) => {
      const distanceFrom = hostile.safeRangeXY(offsetPos.x, offsetPos.y)
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
  })
  return bestDirection
}
