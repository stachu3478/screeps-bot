export default class ResourceMiningCalculator {
  private distance: number
  private power: number
  private cooldown: number
  private time: number

  constructor(
    distance: number,
    power = HARVEST_MINERAL_POWER,
    cooldown = EXTRACTOR_COOLDOWN,
    time = CREEP_LIFE_TIME * 0.7,
  ) {
    this.distance = distance
    this.power = power
    this.cooldown = cooldown
    this.time = time
  }

  getFor(carryParts: number, workParts: number) {
    const fullRounds = this.getFullRoundCount(carryParts, workParts)
    const resourcePerRound = this.getHarvestAmountPerRound(
      carryParts,
      workParts,
    )
    const minedPerFullRounds = fullRounds * resourcePerRound
    const remainingTime =
      this.time - fullRounds * this.getFullRoundTime(carryParts, workParts)
    const timeToMine = Math.max(0, remainingTime - this.distance)
    const miningAtLast = this.getHarvestAmountPerTime(workParts, timeToMine)
    return minedPerFullRounds + miningAtLast
  }

  private getHarvestAmountPerTime(workParts: number, time: number) {
    const miningOperations = Math.floor((time - 1) / this.cooldown + 1)
    return miningOperations * this.power * workParts
  }

  private getFullRoundCount(carryParts: number, workParts: number) {
    const roundTime = this.getFullRoundTime(carryParts, workParts)
    return Math.floor(this.time / roundTime)
  }

  private getFullRoundTime(carryParts: number, workParts: number) {
    const harvestOperations = this.getHarvestOperationsCount(
      carryParts,
      workParts,
    )
    const miningTime = (harvestOperations - 1) * this.cooldown + 1
    return miningTime + this.distance
  }

  private getHarvestAmountPerRound(carryParts: number, workParts: number) {
    return (
      this.getHarvestOperationsCount(carryParts, workParts) *
      this.power *
      workParts
    )
  }

  private getHarvestOperationsCount(carryParts: number, workParts: number) {
    return Math.floor((carryParts * CARRY_CAPACITY) / (this.power * workParts))
  }
}
