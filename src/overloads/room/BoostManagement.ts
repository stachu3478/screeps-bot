Room.prototype.getBoosts = function () {
  return (
    this.memory.boosts ||
    (this.memory.boosts = {
      creeps: [],
      labs: [],
    })
  )
}

Room.prototype.getAmountReserved = function (resource: ResourceConstant) {
  const labBoostData = this.getBoosts().labs.find(
    (labBoostRecord) =>
      labBoostRecord[LabBoostDataKeys.resourceType] === resource,
  )
  return labBoostData ? labBoostData[LabBoostDataKeys.amount] : 0
}

Room.prototype.getAvailableBoosts = function (
  resource: ResourceConstant,
  partCount: number,
) {
  if (!this.terminal) return 0
  const amountAvailable =
    this.terminal.store[resource] - this.getAmountReserved(resource)
  const partsAvailable = Math.floor(amountAvailable / LAB_BOOST_MINERAL)
  return Math.min(partsAvailable, partCount)
}

Room.prototype.getBoostRequest = function (creepName: string) {
  const boosts = this.getBoosts()
  const toBeRemoved: ResourceConstant[] = []
  let labId
  boosts.creeps.find((creepBoostData, i) => {
    const [name, resourceNeeded] = creepBoostData
    if (name !== creepName) return false
    const lab = this.externalLabs.find(
      (lab) => lab.mineralType === resourceNeeded,
    )
    if (lab) {
      labId = lab.id
      return true
    }
    toBeRemoved.push(resourceNeeded)
    return false
  })
  toBeRemoved
    .reverse()
    .forEach((resource) => this.clearBoostRequest(creepName, resource))
  return labId
}

Room.prototype.getBestAvailableBoost = function (
  partType: string,
  action: string,
  partCount: number,
) {
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
  if (bestRank > 0)
    return {
      resource: bestResource,
      partCount: bestPartCount,
    }
  return null
}

Room.prototype.createBoostRequest = function (
  creepName: string,
  resource: ResourceConstant,
  partCount: number,
  mandatory: boolean = false,
) {
  const boostData = this.getBoosts()
  let indexToInsert = boostData.labs.findIndex(
    (labBoostData) => labBoostData[LabBoostDataKeys.resourceType] === resource,
  )
  if (indexToInsert === -1)
    indexToInsert = boostData.labs.findIndex(
      (labBoostData) => !labBoostData[LabBoostDataKeys.amount],
    )
  if (indexToInsert === -1) indexToInsert = boostData.labs.length
  const potencialRecord = boostData.labs[indexToInsert]
  const amountForCreep = partCount * LAB_BOOST_MINERAL
  const amountForLab =
    (potencialRecord ? potencialRecord[LabBoostDataKeys.amount] : 0) +
    amountForCreep
  boostData.labs[indexToInsert] = [resource, amountForLab]
  boostData.creeps.push([
    creepName,
    resource,
    amountForCreep,
    mandatory ? 1 : 0,
  ])
}

Room.prototype.clearBoostRequest = function (
  creepName: string,
  resource: ResourceConstant | null,
  done: boolean = false,
) {
  if (!resource) return
  const boostData = this.getBoosts()
  let toRemove: string | undefined = undefined
  let resourceToRemove: ResourceConstant = RESOURCE_ENERGY
  const indexToRemove = boostData.creeps.findIndex((creepBoostData) => {
    const [name, resourceType, , mandatory] = creepBoostData
    if (name === creepName)
      return resourceType === resource && (done || !mandatory)
    const creep = Game.creeps[name]
    if (name && (!creep || creep.memory.role !== Role.BOOSTER) && !mandatory) {
      toRemove = name
      resourceToRemove = resourceType
    }
    return false
  })
  if (indexToRemove !== -1) {
    const labIndex = boostData.labs.findIndex(
      (labBoostRecord) =>
        labBoostRecord[LabBoostDataKeys.resourceType] === resource,
    )
    const labBoostData = boostData.labs[labIndex]
    const [resourceType, amount] = labBoostData
    if (amount)
      labBoostData[LabBoostDataKeys.amount] =
        amount - boostData.creeps[indexToRemove][CreepBoostDataKeys.amount]
    if (amount === 0) {
      if (boostData.labs.length === labIndex + 1) boostData.labs.pop()
      else boostData.labs[labIndex] = [resourceType, 0]
    }
    boostData.creeps.splice(indexToRemove, 1)
  }
  if (toRemove) this.clearBoostRequest(toRemove, resourceToRemove)
}

Room.prototype.prepareBoostData = function (
  creepMemory: CreepMemory,
  parts: BodyPartConstant[],
  actions: string[],
  body: BodyPartConstant[],
) {
  const boostRequests: BoostInfo[] = []
  parts.forEach((part, i) => {
    const boostInfo = this.getBestAvailableBoost(
      part,
      actions[i],
      body.filter((type) => type === part).length,
    )
    if (boostInfo) boostRequests.push(boostInfo)
  })
  if (boostRequests.length) {
    creepMemory._targetRole = creepMemory.role
    creepMemory.role = Role.BOOSTER
  }
  return boostRequests
}
