import { BOOSTER } from "constants/role";

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

Room.prototype.getBoostRequest = function (creepName: string) {
  const boosts = this.getBoosts()
  const toBeRemoved: ResourceConstant[] = []
  let labId
  boosts.creeps.find((name, i) => {
    if (name !== creepName) return false
    const resourceNeeded = boosts.resources.creeps[i]
    const lab = this.externalLabs.find(lab => lab.mineralType === resourceNeeded)
    if (lab) {
      labId = lab.id
      return true
    }
    toBeRemoved.push(resourceNeeded)
    return false
  })
  toBeRemoved.reverse().forEach(resource => this.clearBoostRequest(creepName, resource))
  return labId
}

Room.prototype.getBestAvailableBoost = function (partType: string, action: string, partCount: number) {
  if (!this.externalLabs.length) return null
  const partTypeSpecifiedBoosts = BOOSTS[partType]
  let bestResource: ResourceConstant = RESOURCE_ENERGY
  let bestPartCount = 0
  let bestRank = 0
  for (const mineral in partTypeSpecifiedBoosts) {
    const availableActions = partTypeSpecifiedBoosts[mineral]
    if (!availableActions[action]) continue
    const resource = mineral as ResourceConstant
    const availableBoosts = this.getAvailableBoosts(resource, partCount)
    const rank = availableBoosts * availableActions[action]
    if (rank > bestRank) {
      bestResource = resource
      bestPartCount = availableBoosts
      bestRank = rank
    }
  }
  if (bestRank > 0) return {
    resource: bestResource,
    partCount: bestPartCount
  }
  return null
}

Room.prototype.createBoostRequest = function (creepName: string, resource: ResourceConstant, partCount: number) {
  const boostData = this.getBoosts()
  let indexToInsert = boostData.resources.labs.findIndex(res => res === resource)
  if (indexToInsert === -1) indexToInsert = boostData.resources.labs.findIndex(res => !res)
  if (indexToInsert === -1) indexToInsert = boostData.resources.labs.length
  const amountForCreep = partCount * LAB_BOOST_MINERAL
  const amountForLab = (boostData.amounts.labs[indexToInsert] || 0) + amountForCreep
  boostData.amounts.labs[indexToInsert] = amountForLab
  boostData.resources.labs[indexToInsert] = resource
  boostData.creeps.push(creepName)
  boostData.amounts.creeps.push(amountForCreep)
  boostData.resources.creeps.push(resource)
}

Room.prototype.clearBoostRequest = function (creepName: string, resource: ResourceConstant | null) {
  if (!resource) return
  const boostData = this.getBoosts()
  let toRemove: string | undefined = undefined
  let resourceToRemove: ResourceConstant = RESOURCE_ENERGY
  const indexToRemove = boostData.creeps.findIndex((name, index) => {
    if (name === creepName) return boostData.resources.creeps[index] === resource
    const creep = Game.creeps[name]
    if (name && (!creep || creep.memory.role !== BOOSTER)) {
      toRemove = name
      resourceToRemove = boostData.resources.creeps[index]
    }
    return false
  })
  if (indexToRemove !== -1) {
    const labIndex = boostData.resources.labs.findIndex((res) => res === resource)
    const labAmount = boostData.amounts.labs[labIndex]
    if (labAmount) boostData.amounts.labs[labIndex] = labAmount - boostData.amounts.creeps[indexToRemove]
    if (boostData.amounts.labs[labIndex] === 0) {
      if (boostData.amounts.labs.length === labIndex + 1) {
        boostData.amounts.labs.pop()
        boostData.resources.labs.pop()
      } else {
        delete boostData.amounts.labs[labIndex]
        delete boostData.resources.labs[labIndex]
      }
    }
    boostData.creeps.splice(indexToRemove, 1)
    boostData.amounts.creeps.splice(indexToRemove, 1)
    boostData.resources.creeps.splice(indexToRemove, 1)
  }
  if (toRemove) this.clearBoostRequest(toRemove, resourceToRemove)
}
