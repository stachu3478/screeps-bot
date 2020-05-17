export const carryCost = BODYPART_COST[CARRY]
export const workCost = BODYPART_COST[WORK]
export const moveCost = BODYPART_COST[MOVE]
export const workPack = workCost + carryCost + moveCost
export const liteWorkPack = workCost + moveCost
export const carryPack = 2 * carryCost + moveCost
export const liteCarryPack = carryCost + moveCost
export const moveWorkPack = 2 * workCost + moveCost
export const fightPack = 2 * BODYPART_COST[ATTACK] + moveCost
export const liteFightPack = BODYPART_COST[ATTACK] + moveCost
export const toughPack = 2 * BODYPART_COST[TOUGH] + moveCost
