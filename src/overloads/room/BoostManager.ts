export default class BoostManager {
  private room: Room
  private memory: BoostData

  constructor(room: Room) {
    const roomMemory = room.memory
    this.room = room
    this.memory =
      roomMemory.boosts ||
      (roomMemory.boosts = {
        creeps: [],
        labs: [],
      })
  }

  getAmountReserved(resource: ResourceConstant) {
    const labBoostData = this.labs.find(
      (labBoostRecord) =>
        labBoostRecord[LabBoostDataKeys.resourceType] === resource,
    )
    return labBoostData ? labBoostData[LabBoostDataKeys.amount] : 0
  }

  getAvailable(resource: ResourceConstant, partCount: number) {
    if (!this.terminal) return 0
    const amountAvailable =
      this.terminal.store[resource] - this.getAmountReserved(resource)
    const partsAvailable = Math.floor(amountAvailable / LAB_BOOST_MINERAL)
    return Math.min(partsAvailable, partCount)
  }

  getRequest(creepName: string) {
    const toBeRemoved: ResourceConstant[] = []
    let labId
    this.creeps.find((creepBoostData, i) => {
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
      .forEach((resource) => this.clearRequest(creepName, resource))
    return labId
  }

  getBestAvailable(partType: string, action: string, partCount: number) {
    if (!this.externalLabs.length) return null
    const partTypeSpecifiedBoosts = BOOSTS[partType]
    let bestResource: ResourceConstant = RESOURCE_ENERGY
    let bestPartCount = 0
    let bestRank = 0
    for (const mineral in partTypeSpecifiedBoosts) {
      const availableActions = partTypeSpecifiedBoosts[mineral]
      if (!availableActions[action]) continue
      const resource = mineral as ResourceConstant
      const availableBoosts = this.getAvailable(resource, partCount)
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

  createRequest(
    creepName: string,
    resource: ResourceConstant,
    partCount: number,
    mandatory: boolean = false,
  ) {
    let indexToInsert = this.labs.findIndex(
      (labBoostData) =>
        labBoostData[LabBoostDataKeys.resourceType] === resource,
    )
    if (indexToInsert === -1)
      indexToInsert = this.labs.findIndex(
        (labBoostData) => !labBoostData[LabBoostDataKeys.amount],
      )
    if (indexToInsert === -1) indexToInsert = this.labs.length
    const potencialRecord = this.labs[indexToInsert]
    const amountForCreep = partCount * LAB_BOOST_MINERAL
    const amountForLab =
      (potencialRecord ? potencialRecord[LabBoostDataKeys.amount] : 0) +
      amountForCreep
    this.labs[indexToInsert] = [resource, amountForLab]
    this.creeps.push([creepName, resource, amountForCreep, mandatory ? 1 : 0])
  }

  clearRequest(
    creepName: string,
    resource: ResourceConstant | null,
    done: boolean = false,
  ) {
    if (!resource) return
    let toRemove: string | undefined = undefined
    let resourceToRemove: ResourceConstant = RESOURCE_ENERGY
    const indexToRemove = this.creeps.findIndex((creepBoostData) => {
      const [name, resourceType, , mandatory] = creepBoostData
      if (name === creepName)
        return resourceType === resource && (done || !mandatory)
      const creep = Game.creeps[name]
      if (
        name &&
        (!creep || creep.memory.role !== Role.BOOSTER) &&
        !mandatory
      ) {
        toRemove = name
        resourceToRemove = resourceType
      }
      return false
    })
    if (indexToRemove !== -1) {
      const labIndex = this.labs.findIndex(
        (labBoostRecord) =>
          labBoostRecord[LabBoostDataKeys.resourceType] === resource,
      )
      const labBoostData = this.labs[labIndex]
      const [resourceType, amount] = labBoostData
      if (amount)
        labBoostData[LabBoostDataKeys.amount] =
          amount - this.creeps[indexToRemove][CreepBoostDataKeys.amount]
      if (amount === 0) {
        if (this.labs.length === labIndex + 1) this.labs.pop()
        else this.labs[labIndex] = [resourceType, 0]
      }
      this.creeps.splice(indexToRemove, 1)
    }
    if (toRemove) this.clearRequest(toRemove, resourceToRemove)
  }

  prepareData(
    creepMemory: CreepMemory,
    parts: BodyPartConstant[],
    actions: string[],
    body: BodyPartConstant[],
  ) {
    const boostRequests: BoostInfo[] = []
    parts.forEach((part, i) => {
      const boostInfo = this.getBestAvailable(
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

  hasMandatory(creepName: string) {
    return this.creeps.some(
      (b) =>
        b[CreepBoostDataKeys.name] === creepName &&
        !!b[CreepBoostDataKeys.mandatory],
    )
  }

  get labs() {
    return this.memory.labs
  }

  get creeps() {
    return this.memory.creeps
  }

  private get terminal() {
    return this.room.terminal
  }

  private get externalLabs() {
    return this.room.externalLabs
  }
}
