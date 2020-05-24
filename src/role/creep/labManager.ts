import { IDLE, HAUL_LAB_TO_STORAGE, HAUL_LAB_FROM_STORAGE, HAUL_STORAGE_TO_LAB, HAUL_STORAGE_FROM_LAB, LAB_PENDING, LAB_COOLDOWN } from 'constants/state'
import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw';
import fill from 'routine/haul/fill';
import profiler from "screeps-profiler"
import { FACTORY_MANAGER } from 'constants/role';
import handleLab from 'utils/handleLab';

export interface LabManager extends Creep {
  memory: LabManagerMemory
}

interface LabManagerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
  _targetLab?: Id<StructureLab>
}

function findJob(creep: LabManager) {
  const roomMemory = creep.room.memory
  creep.memory.state = IDLE
  const lab1 = creep.room.lab1
  const lab2 = creep.room.lab2
  const resource1 = roomMemory.labIndegrient1
  const resource2 = roomMemory.labIndegrient2
  const targetAmount = roomMemory.labTargetAmount
  const terminal = creep.room.terminal
  if (!lab1 || !lab2) return false
  if (!terminal) return false
  if (roomMemory.labState === LAB_PENDING && roomMemory.labRecipe) {
    if (!targetAmount || !resource1 || !resource2) {
      delete roomMemory.labRecipe
      return false
    }
    if (lab1.store[resource1] < targetAmount) {
      creep.memory._drawAmount = Math.min(targetAmount - lab1.store[resource1], creep.store.getFreeCapacity())
      if (terminal.store[resource1] < creep.memory._drawAmount) return console.log('help1')
      creep.memory._draw = terminal.id
      creep.memory._fillType = creep.memory._drawType = resource1
      creep.memory._targetLab = lab1.id
      creep.memory.state = HAUL_LAB_FROM_STORAGE
    } else if (lab2.store[resource2] < targetAmount) {
      creep.memory._drawAmount = Math.min(targetAmount - lab2.store[resource2], creep.store.getFreeCapacity())
      if (terminal.store[resource2] < creep.memory._drawAmount) return console.log('help2')
      creep.memory._draw = terminal.id
      creep.memory._fillType = creep.memory._drawType = resource2
      creep.memory._targetLab = lab2.id
      creep.memory.state = HAUL_LAB_FROM_STORAGE
    } else {
      roomMemory.labState = LAB_COOLDOWN
      return false
    }
    return true
  } else if (roomMemory.labState === IDLE) {
    const allLabs = creep.room.externalLabs.concat(lab1, lab2)
    let done = false
    allLabs.forEach(lab => {
      if (done) return
      if (lab.mineralType && lab.store[lab.mineralType] > 0) {
        creep.memory._draw = lab.id
        delete creep.memory._drawAmount
        creep.memory._fillType = creep.memory._drawType = lab.mineralType
        creep.memory.state = HAUL_STORAGE_FROM_LAB
        done = true
      }
    })
    if (done) return true
    else handleLab(terminal)
  }
  return false
}

export default profiler.registerFN(function labManager(creep: LabManager) {
  switch (creep.memory.state) {
    case IDLE: {
      if (findJob(creep)) break
      if (creep.store.getUsedCapacity() === 0) {
        creep.memory.role = FACTORY_MANAGER
        break
      }
      for (const name in creep.store) {
        const resource = name as ResourceConstant
        if (creep.store[resource] > 0) {
          const potentialStructure = creep.room.terminal || creep.room.storage || creep.room.factory
          if (potentialStructure) {
            creep.memory._fill = potentialStructure.id
            creep.memory._fillType = resource
            creep.memory.state = HAUL_LAB_TO_STORAGE
          } else creep.drop(resource)
          break
        }
      }
    } break
    case HAUL_LAB_FROM_STORAGE: {
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          const labId = creep.memory._targetLab
          if (labId) {
            creep.memory._fill = creep.memory._targetLab
            creep.memory.state = HAUL_STORAGE_TO_LAB
          } else creep.memory.state = HAUL_LAB_TO_STORAGE
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = IDLE; break
      }
    } break
    case HAUL_STORAGE_TO_LAB: {
      switch (fill(creep)) {
        case DONE: case SUCCESS: creep.memory.state = IDLE; break
        case NOTHING_TODO: case FAILED:
          if (!creep.room.terminal) break
          creep.memory._fill = creep.room.terminal.id
          creep.memory.state = HAUL_LAB_TO_STORAGE
          break
      }
    } break
    case HAUL_STORAGE_FROM_LAB: {
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          if (creep.room.terminal) {
            creep.memory._fill = creep.room.terminal.id
            creep.memory.state = HAUL_LAB_TO_STORAGE
          } else creep.memory.state = HAUL_STORAGE_TO_LAB
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = IDLE; break
      }
    } break
    case HAUL_LAB_TO_STORAGE: {
      switch (fill(creep)) {
        case DONE: case SUCCESS: creep.memory.state = IDLE; break
        case NOTHING_TODO: case FAILED:
          if (creep.memory._fillType) creep.drop(creep.memory._fillType)
          creep.memory.state = IDLE
          break
      }
    } break
    default: findJob(creep)
  }
}, 'roleLabManager')
