export const getSourceToControllerElapseTime = (carryPartCount: number, workPartCount: number, distance: number): number => {
  const capacity = getSourceToControllerElapseEarn(carryPartCount)
  return capacity / (HARVEST_POWER * workPartCount) + (distance << 1) + capacity / workPartCount
}

export const getSourceToControllerElapseEarn = (carryPartCount: number): number => carryPartCount * CARRY_CAPACITY
export const getCreepCost = (bodyParts: BodyPartConstant[]): number => bodyParts.reduce((cost, part) => cost + BODYPART_COST[part], 0)
export const getWorkSaturation = (workTime: number, moveTime: number): number => workTime / (workTime + moveTime)
export const getMaximumWorkPartsForSource = (workSaturation: number): number => SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / workSaturation
export const getTotalControllerEarn = (bodyParts: BodyPartConstant[], distance: number): number => {
  const workBodyParts = bodyParts.reduce((total, part) => total + ((part === WORK) ? 1 : 0), 0)
  const carryBodyParts = bodyParts.reduce((total, part) => total + ((part === CARRY) ? 1 : 0), 0)
  const moveBodyParts = bodyParts.reduce((total, part) => total + ((part === MOVE) ? 1 : 0), 0)
  const moveTime = bodyParts.length / (moveBodyParts * 3)
  const elapseTime = getSourceToControllerElapseTime(carryBodyParts, workBodyParts, distance * moveTime)
  const cycles = Math.floor((CREEP_LIFE_TIME / elapseTime) + 0.5)
  return cycles * getSourceToControllerElapseEarn(carryBodyParts) - getCreepCost(bodyParts)
}
