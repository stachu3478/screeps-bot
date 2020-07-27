import { LabManager } from "role/creep/labManager.d";

const labJobs = {
  prepareReaction: (lab1: StructureLab, lab2: StructureLab, terminal: StructureTerminal, roomMemory: RoomMemory, creep: LabManager) => {
    const resource1 = roomMemory.labIndegrient1
    const resource2 = roomMemory.labIndegrient2
    const targetAmount = roomMemory.labTargetAmount
    if (!targetAmount || !resource1 || !resource2) {
      delete roomMemory.labRecipe
      return false
    }
    if (
      (lab1.store[resource1] < targetAmount && labJobs.prepareCreepForFilling(creep, lab1, resource1, targetAmount))
      || (lab2.store[resource2] < targetAmount && labJobs.prepareCreepForFilling(creep, lab2, resource2, targetAmount))
    ) return true
    roomMemory.labState = State.LAB_PRODUCING
    return false
  },
  collectResources: (creep: LabManager, labs: StructureLab[]) => {
    return labs.some((lab, i) => {
      const mineralType = lab.mineralType
      const labBoostData = lab.room.getBoosts().labs[i]
      if (mineralType && lab.store[mineralType] > 0 && (!labBoostData || labBoostData[LabBoostDataKeys.amount])) {
        labJobs.prepareCreepForDumping(creep, lab.id, mineralType)
        return true
      }
      return false
    })
  },
  needsToBeFilledForBoosting: (lab: StructureLab, resourceToFillWith: ResourceConstant, amountToFillWith: number) => {
    const mineralType = lab.mineralType
    if (!mineralType) return true
    if (lab.mineralType !== resourceToFillWith) return false
    if (lab.store[mineralType] < Math.min(amountToFillWith, LAB_MINERAL_CAPACITY)) return true
    return false
  },
  needsToBeDumpedForBoosting: (lab: StructureLab, resourceToFillWith: ResourceConstant) => {
    const mineralType = lab.mineralType
    if (!mineralType) return false
    if (lab.mineralType !== resourceToFillWith) return true
    return false
  },
  prepareCreepForFilling: (creep: LabManager, lab: StructureLab, resourceToFillWith: ResourceConstant, amountToFillWith: number) => {
    const terminal = creep.room.terminal
    if (!terminal) return false
    const missing = amountToFillWith - lab.store[resourceToFillWith]
    if (terminal.store[resourceToFillWith] < missing) return false
    creep.memory._drawAmount = Math.min(missing, creep.store.getFreeCapacity())
    creep.memory._draw = terminal.id
    creep.memory._fillType = creep.memory._drawType = resourceToFillWith
    creep.memory._targetLab = lab.id
    creep.memory.state = State.HAUL_LAB_FROM_STORAGE
    return true
  },
  prepareCreepForDumping: (creep: LabManager, labId: Id<StructureLab>, mineralType: ResourceConstant) => {
    creep.memory._draw = labId
    delete creep.memory._drawAmount
    creep.memory._fillType = creep.memory._drawType = mineralType
    creep.memory.state = State.HAUL_STORAGE_FROM_LAB
  },
  lookForBoosting: (creep: LabManager, labBoostData: BoostData['labs'][0], lab: StructureLab) => {
    const [resourceToFillWith, amountToFillWith] = labBoostData
    if (!resourceToFillWith || !amountToFillWith) return false
    if (
      labJobs.needsToBeFilledForBoosting(lab, resourceToFillWith, amountToFillWith)
      && labJobs.prepareCreepForFilling(creep, lab, resourceToFillWith, amountToFillWith)) {
      return true
    } else if (labJobs.needsToBeDumpedForBoosting(lab, resourceToFillWith)) {
      labJobs.prepareCreepForDumping(creep, lab.id, lab.mineralType as ResourceConstant)
      return true
    }
    return false
  },
  prepareBoostResources: (creep: LabManager, externalLabs: StructureLab[]) => {
    const boostData = creep.room.getBoosts()
    if (boostData.labs.length === 0) return false
    return boostData.labs.some((labBoostData, index) => {
      const lab = externalLabs[index]
      if (lab) return labJobs.lookForBoosting(creep, labBoostData, lab)
      return false
    })
  }
}

export default labJobs
