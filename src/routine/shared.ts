/**
 * Tries to find best move direction basing on least distance to other room positions
 */
export function pickBestDirectionFrom(
  creep: Creep,
  hostiles: Creep[],
  predicate: (leastSafeDistance: number) => number,
) {
  let bestDirection: DirectionConstant = 1
  let bestPrediction = -Infinity
  for (let i = 1; i <= 8; i++) {
    const direction = i as DirectionConstant
    const offsetPos = creep.pos.offset(direction)
    if (!offsetPos.isWalkable) continue
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
  }
  return bestDirection
}
