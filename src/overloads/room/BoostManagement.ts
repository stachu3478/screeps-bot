Room.prototype.getBoosts = function () {
  return this.memory.boosts || (this.memory.boosts = {
    creeps: [],
    resources: {
      labs: [],
      creeps: [],
    },
    amounts: {
      labs: [],
      creeps: []
    }
  })
}

Room.prototype.getAmountReserved = function (resource: ResourceConstant) {
  const boosts = this.getBoosts()
  return boosts.amounts.labs[boosts.resources.labs.findIndex(v => v === resource)] || 0
}

Room.prototype.getAvailableBoosts = function (resource: ResourceConstant, partCount: number) {
  if (!this.terminal) return 0
  const amountAvailable = this.terminal.store[resource] - this.getAmountReserved(resource)
  const partsAvailable = Math.floor(amountAvailable / LAB_BOOST_MINERAL)
  return Math.min(partsAvailable, partCount)
}
