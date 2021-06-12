import _ from 'lodash'

export default class ResourceMiningCalculator {
  private distance: number
  private power: number
  private cooldown: number
  private time: number
  private carryParts: number = 0
  private workParts: number = 0

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

  optimize() {
    const partsToUse = MAX_CREEP_SIZE / 2
    const workCombinations = new Array(partsToUse).fill(0).map((_, i) => i)
    this.workParts = _.max(workCombinations, (_, i) => {
      if (i === 0) {
        return -Infinity
      }
      const carryParts = partsToUse - i
      const mined = this.getFor(carryParts, i)
      return mined
    })
    this.carryParts = partsToUse - this.workParts
    return this.getFor(this.carryParts, this.workParts)
  }

  getFor(carryParts: number, workParts: number) {
    this.carryParts = carryParts
    this.workParts = workParts
    const fullRounds = this.getFullRoundCount()
    const resourcePerRound = this.getHarvestAmountPerRound()
    const minedPerFullRounds = fullRounds * resourcePerRound
    const remainingTime = this.time - fullRounds * this.getFullRoundTime()
    const timeToMine = Math.max(0, remainingTime - this.distance)
    const miningAtLast = this.getHarvestAmountPerTime(timeToMine)
    return minedPerFullRounds + miningAtLast
  }

  private getHarvestAmountPerTime(time: number) {
    const miningOperations = Math.floor((time - 1) / this.cooldown + 1)
    return miningOperations * this.power * this.workParts
  }

  private getFullRoundCount() {
    const roundTime = this.getFullRoundTime()
    return Math.floor(this.time / roundTime)
  }

  private getFullRoundTime() {
    const harvestOperations = this.getHarvestOperationsCount()
    const miningTime = (harvestOperations - 1) * this.cooldown + 1
    return miningTime + this.distance
  }

  private getHarvestAmountPerRound() {
    return this.getHarvestOperationsCount() * this.power * this.workParts
  }

  private getHarvestOperationsCount() {
    return Math.floor(
      (this.carryParts * CARRY_CAPACITY) / (this.power * this.workParts),
    )
  }

  get work() {
    return this.workParts
  }

  get carry() {
    return this.carryParts
  }

  get creepCost() {
    return (
      this.workParts * BODYPART_COST[WORK] +
      this.carryParts +
      BODYPART_COST[CARRY] +
      (MAX_CREEP_SIZE / 2) * BODYPART_COST[MOVE]
    )
  }
}
