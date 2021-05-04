import { fightPack, liteFightPack, toughPack } from './packs'

function hybridPack(
  type1: BodyPartConstant,
  type2: BodyPartConstant,
  count: number,
) {
  return new Array(count * 2)
    .fill(0)
    .map((_, i) => (i % 2 === 0 ? type1 : type2))
}

export function carryPacks(count: number) {
  return hybridPack(CARRY, MOVE, count)
}

export function scoreDigger(energy: number) {
  const workPackEnergy = energy - BODYPART_COST[ATTACK]
  const workPacks = Math.min(
    Math.floor(workPackEnergy / BODYPART_COST[WORK]),
    49,
  )
  const arr: BodyPartConstant[] = [ATTACK]
  return arr.concat(new Array(workPacks).fill(WORK))
}

export function scorer(energy: number, toBeDelivered: number) {
  const carryParts = Math.floor(Math.min(energy / 100, toBeDelivered / 150, 25))
  return carryPacks(carryParts)
}

export function ranger() {
  return new Array(17)
    .fill(RANGED_ATTACK)
    .concat(new Array(25).fill(MOVE))
    .concat(new Array(8).fill(HEAL))
}

export function progressiveClaimer(
  energy: number,
  maxParts: number = MAX_CREEP_SIZE,
) {
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

export function progressiveFighter(energy: number) {
  const parts: BodyPartConstant[] = []
  let remaining = energy - fightPack
  let attackParts = 2
  let moveParts = 1
  let partsRemaining = MAX_CREEP_SIZE - attackParts - moveParts
  let toughParts = 0
  while (remaining >= fightPack && partsRemaining >= 3) {
    attackParts += 2
    remaining -= fightPack
    partsRemaining -= 3
    moveParts++
  }
  if (remaining >= liteFightPack && partsRemaining >= 2) {
    attackParts++
    remaining -= liteFightPack
    partsRemaining -= 2
    moveParts++
  }
  if (remaining >= toughPack && partsRemaining >= 3) {
    partsRemaining -= 3
    toughParts += 2
    moveParts++
  }
  for (let i = 0; i < toughParts; i++) parts.push(TOUGH)
  for (let i = 0; i < moveParts; i++) parts.push(MOVE)
  for (let i = 0; i < attackParts; i++) parts.push(ATTACK)
  return parts
}

export function progressiveCommander(energy: number, level: number = 1) {
  // calc basic level cost
  const parts: BodyPartConstant[] = []
  const levelCost =
    level *
    (BODYPART_COST[TOUGH] + BODYPART_COST[ATTACK] + 2 * BODYPART_COST[MOVE])
  let attackParts = level
  let toughParts = level

  // calc heal cost
  const dualCost = BODYPART_COST[HEAL] + BODYPART_COST[MOVE]
  let remaining = energy - levelCost
  if (remaining < 0) remaining = 0
  let partsRemaining = MAX_CREEP_SIZE - level * 4
  let healParts = Math.min(Math.floor(remaining / dualCost), partsRemaining / 2)
  if (healParts < 1) healParts = 1
  partsRemaining -= healParts * 2
  remaining -= healParts * dualCost

  // add addictional attack parts if energy available
  const attackCost = BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]
  while (remaining >= attackCost && partsRemaining > 1) {
    remaining -= attackCost
    attackParts++
    partsRemaining -= 2
  }

  // add addictional tough parts if energy available
  const toughCost = BODYPART_COST[TOUGH] + BODYPART_COST[MOVE]
  while (remaining >= toughCost && partsRemaining > 1) {
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
