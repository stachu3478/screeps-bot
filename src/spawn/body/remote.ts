import { liteCarryPack, carryCost, workCost, moveCost } from "./packs";

function getEfficiency(carryParts: number, workParts: number, distance: number, cooldown: number = EXTRACTOR_COOLDOWN) {
  return carryParts / (distance + cooldown * carryParts / workParts)
}

export function optimalRemoteMiner(energy: number, distance: number) {
  const max = MAX_CREEP_SIZE
  let usedParts = 4
  let used = carryCost + workCost + 2 * moveCost
  let carryCount = 1
  let workCount = 1
  let moveCount = 2
  while (used + liteCarryPack <= energy && usedParts + 2 <= max) {
    carryCount++
    moveCount++
    usedParts += 2
    used += liteCarryPack
  }
  const twoWay = 2 * distance

  let currentEfficiency = getEfficiency(carryCount, workCount, twoWay)
  let nextEfficiency = getEfficiency(carryCount, workCount, twoWay)
  do {
    currentEfficiency = nextEfficiency
    // get next limited with one more work
    used += workCost + moveCost
    workCount++
    moveCount++
    usedParts += 2
    while ((used > energy || usedParts > max) && carryCount > 0) {
      carryCount--
      moveCount--
      usedParts -= 2
      used -= liteCarryPack
    }
    nextEfficiency = getEfficiency(carryCount, workCount, twoWay)
  } while (nextEfficiency > currentEfficiency)

  // restore previous state
  used -= workCost - moveCost
  workCount--
  moveCount--
  usedParts -= 2
  while (used + liteCarryPack <= energy && usedParts + 2 <= max) {
    carryCount++
    moveCount++
    usedParts += 2
    used += liteCarryPack
  }
  if (carryCount < 1) {
    moveCount += -carryCount + 1
    carryCount = 1
  }
  const partArray: BodyPartConstant[] = []
  return partArray
    .concat(new Array(workCount).fill(WORK))
    .concat(new Array(carryCount).fill(CARRY))
    .concat(new Array(moveCount).fill(MOVE))
}
