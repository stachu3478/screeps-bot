import {
  workPack,
  liteWorkPack,
  carryPack,
  liteCarryPack,
  moveWorkPack,
} from './packs'

function progressiveStaticWorker(energy: number, maxWork: number) {
  let currentWork = 0
  const parts: BodyPartConstant[] = [CARRY]
  let remaining = energy - BODYPART_COST[CARRY]
  while (remaining >= moveWorkPack && currentWork + 2 <= maxWork) {
    parts.push(WORK, WORK, MOVE)
    remaining -= moveWorkPack
    currentWork += 2
  }
  const lessPack = BODYPART_COST[WORK] + BODYPART_COST[MOVE]
  if (remaining >= lessPack && currentWork < maxWork) {
    parts.push(WORK, MOVE)
    remaining -= lessPack
  }
  return parts
}

export function progressiveStaticUpgrader(
  energy: number,
  upgradeLimited: boolean = false,
) {
  let maxWork =
    -1 +
    (2 * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME / UPGRADE_CONTROLLER_POWER
  if (upgradeLimited)
    maxWork = Math.min(maxWork, CONTROLLER_MAX_UPGRADE_PER_TICK)
  return progressiveStaticWorker(energy, maxWork)
}

export function progressiveMiner(energy: number) {
  const maxWork = 1 + SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / HARVEST_POWER
  return progressiveStaticWorker(energy, maxWork)
}

export function progressiveMobileWorker(energy: number) {
  const parts: BodyPartConstant[] = []
  let remaining = energy
  let partsRemaining = MAX_CREEP_SIZE
  parts.push(CARRY)
  remaining -= BODYPART_COST[CARRY]
  partsRemaining--
  const workForMining =
    SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / HARVEST_POWER
  let maxWork = 1 + workForMining / BUILD_POWER + workForMining
  while (remaining >= liteWorkPack && partsRemaining >= 2 && maxWork-- > 0) {
    parts.push(WORK, MOVE)
    remaining -= liteWorkPack
    partsRemaining -= 2
  }
  if (remaining >= BODYPART_COST[CARRY] && partsRemaining > 0) parts.push(CARRY)
  return parts
}

export function progressiveWorker(
  energy: number,
  maxWork: number = MAX_CREEP_SIZE,
) {
  const parts = [WORK, CARRY, MOVE]
  let remaining = energy - workPack
  let partsRemaining = MAX_CREEP_SIZE - 3
  let workRemaining = maxWork - 1
  while (remaining >= workPack && partsRemaining >= 3 && workRemaining > 0) {
    parts.push(WORK, CARRY, MOVE)
    remaining -= workPack
    partsRemaining -= 3
    workRemaining--
  }
  if (remaining >= liteWorkPack && partsRemaining >= 2 && workRemaining > 0)
    parts.push(WORK, MOVE)
  else if (remaining >= liteCarryPack && partsRemaining >= 2)
    parts.push(CARRY, MOVE)
  return parts
}

export function progressiveLiteWorker(energy: number): BodyPartConstant[] {
  let workRemaining =
    1 + SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / BUILD_POWER
  const parts: BodyPartConstant[] = []
  let remaining = energy
  let partsRemaining = MAX_CREEP_SIZE
  while (remaining >= workPack && partsRemaining >= 3 && workRemaining > 0) {
    parts.push(WORK, CARRY, MOVE)
    remaining -= workPack
    partsRemaining -= 3
    workRemaining--
  }
  while (remaining >= carryPack && partsRemaining >= 3) {
    parts.push(CARRY, CARRY, MOVE)
    remaining -= carryPack
    partsRemaining -= 3
  }
  if (remaining >= liteWorkPack && partsRemaining >= 2 && workRemaining > 0)
    parts.push(WORK, MOVE)
  else if (remaining >= liteCarryPack && partsRemaining >= 2)
    parts.push(CARRY, MOVE)
  return parts
}
