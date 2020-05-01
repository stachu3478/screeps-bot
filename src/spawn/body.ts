export function progressiveWorker(energy: number, maxWork: number = MAX_CREEP_SIZE) {
  const parts = [WORK, CARRY, MOVE]
  let remaining = energy - 200
  let partsRemaining = MAX_CREEP_SIZE - 3
  let workRemaining = maxWork - 1
  while (remaining >= 200 && partsRemaining >= 3 && workRemaining > 0) {
    parts.push(WORK, CARRY, MOVE)
    remaining -= 200
    partsRemaining -= 3
    workRemaining--
  }
  if (remaining >= 150 && partsRemaining >= 2 && workRemaining > 0) parts.push(WORK, MOVE)
  else if (remaining >= 100 && partsRemaining >= 2) parts.push(CARRY, MOVE)
  return parts
}

export function progressiveClaimer(energy: number, maxParts: number = MAX_CREEP_SIZE) {
  const parts = [CLAIM, MOVE]
  const dualCost = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
  let remaining = energy - dualCost
  let partsRemaining = maxParts - 2
  while (remaining >= dualCost) {
    parts.push(MOVE, CLAIM)
    remaining -= dualCost
    partsRemaining -= 2
  }
  if (remaining >= BODYPART_COST[MOVE] && partsRemaining > 0) parts.push(MOVE)
  return parts
}

export function progressiveCommander(energy: number, level: number = 1) {
  // calc basic level cost
  const parts: BodyPartConstant[] = []
  const levelCost = level * (BODYPART_COST[TOUGH] + BODYPART_COST[ATTACK] + 2 * BODYPART_COST[MOVE])
  let attackParts = level
  let toughParts = level

  // calc heal cost
  const dualCost = BODYPART_COST[HEAL] + BODYPART_COST[MOVE]
  let remaining = energy - levelCost
  if (remaining < 0) remaining = 0
  let partsRemaining = MAX_CREEP_SIZE - level * 4 - 2
  const healParts = 1 + Math.floor(remaining / dualCost)
  remaining -= healParts * dualCost

  // add addictional attack parts if energy available
  const attackCost = BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]
  while (remaining >= attackCost && partsRemaining > 0) {
    remaining -= attackCost
    attackParts++
    partsRemaining -= 2
  }

  // add addictional tough parts if energy available
  const toughCost = BODYPART_COST[TOUGH] + BODYPART_COST[MOVE]
  while (remaining >= toughCost && partsRemaining > 0) {
    remaining -= toughCost
    toughParts++
    partsRemaining -= 2
  }

  // build creep
  for (let i = 0; i < toughParts; i++) parts.push(TOUGH)
  for (let i = 0; i < attackParts; i++) parts.push(ATTACK)
  const moveParts = toughParts + attackParts + healParts
  for (let i = 0; i < moveParts; i++) parts.push(MOVE)
  for (let i = 0; i < healParts; i++) parts.push(HEAL)
  return parts
}
