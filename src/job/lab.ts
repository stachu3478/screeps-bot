import { LabManager } from "role/creep/labManager.d";
import { HAUL_LAB_FROM_STORAGE, HAUL_STORAGE_FROM_LAB, LAB_PRODUCING } from "constants/state";

const checkLab = (lab: StructureLab, terminal: StructureTerminal, resource: ResourceConstant, targetAmount: number, creep: LabManager) => {
  if (lab.store[resource] < targetAmount) {
    creep.memory._drawAmount = Math.min(targetAmount - lab.store[resource], creep.store.getFreeCapacity())
    if (terminal.store[resource] < creep.memory._drawAmount) return console.log('help1')
    creep.memory._draw = terminal.id
    creep.memory._fillType = creep.memory._drawType = resource
    creep.memory._targetLab = lab.id
    return true
  }
  return false
}

export const prepareReaction = (lab1: StructureLab, lab2: StructureLab, terminal: StructureTerminal, roomMemory: RoomMemory, creep: LabManager) => {
  const resource1 = roomMemory.labIndegrient1
  const resource2 = roomMemory.labIndegrient2
  const targetAmount = roomMemory.labTargetAmount
  if (!targetAmount || !resource1 || !resource2) {
    delete roomMemory.labRecipe
    return false
  }
  if (
    checkLab(lab1, terminal, resource1, targetAmount, creep)
    || checkLab(lab2, terminal, resource2, targetAmount, creep)
  ) {
    creep.memory.state = HAUL_LAB_FROM_STORAGE
  } else {
    roomMemory.labState = LAB_PRODUCING
    return false
  }
  return true
}

export const collectResources = (creep: LabManager, labs: StructureLab[]) => {
  return labs.some(lab => {
    if (lab.mineralType && lab.store[lab.mineralType] > 0) {
      creep.memory._draw = lab.id
      delete creep.memory._drawAmount
      creep.memory._fillType = creep.memory._drawType = lab.mineralType
      creep.memory.state = HAUL_STORAGE_FROM_LAB
      return true
    }
    return false
  })
}
