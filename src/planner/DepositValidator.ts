import remoteMining from 'config/remoteMining'
import ResourceMiningCalculator from 'spawn/body/ResourceMiningCalculator'
import { getAverageCost } from 'utils/handleTerminal'
import range from 'utils/range'

export default class DepositValidator {
  private avgEnergyCost = getAverageCost(RESOURCE_ENERGY)
  private depositCosts: { [key: string]: number | undefined } = {}

  validate(traits: DepositTraits, pathRoom: RoomNeighbourPath) {
    if (!pathRoom.safe) {
      return false
    }
    const cost = this.getDepositDistance(traits, pathRoom)
    const resourceMiningCalc = new ResourceMiningCalculator(
      cost,
      HARVEST_DEPOSIT_POWER,
      traits.lastCooldown || 1,
    )
    const profits = resourceMiningCalc.optimize()
    const creepCost = resourceMiningCalc.creepCost
    const currentReturn =
      (profits * this.getResourceCost(traits.type)) /
      (creepCost * this.avgEnergyCost)
    console.log(
      'Return on ' +
        pathRoom.name +
        ' ' +
        traits.type +
        ' ' +
        traits.lastCooldown +
        ': ' +
        currentReturn,
    )
    return currentReturn >= remoteMining.deposits.minReturn
  }

  private getDepositDistance(
    traits: DepositTraits,
    pathRoom: RoomNeighbourPath,
  ) {
    return pathRoom.cost + range(traits.x + pathRoom.x, traits.y + pathRoom.y)
  }

  private getResourceCost(type: DepositConstant): number {
    const foundCost = this.depositCosts[type]
    if (!foundCost) {
      const cost = getAverageCost(type)
      this.depositCosts[type] = cost
      return cost
    }
    return foundCost
  }
}
