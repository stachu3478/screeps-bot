import ClaimPlanner from 'planner/military/ClaimPlanner'

export default {
  deposits: {
    maxCost: 200,
    minReturn: 2.0,
  },
  sources: {
    maxCost: ClaimPlanner.instance.minCost / 2,
    workParkOverload: 1.2,
    haulerReturnTimeMargin: 10,
    resourcePickupAmountThreshold: 50,
  },
}
