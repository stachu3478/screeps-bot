import { IDLE, HAUL_LAB_TO_STORAGE, HAUL_LAB_FROM_STORAGE, HAUL_STORAGE_TO_LAB, HAUL_STORAGE_FROM_LAB, LAB_PENDING, LAB_COLLECTING, LAB_BOOSTING } from 'constants/state'
import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw';
import fill from 'routine/haul/fill';
import profiler from "screeps-profiler"
import { FACTORY_MANAGER } from 'constants/role';
import handleLab from 'utils/handleLab';
import { LabManager } from './labManager.d'
import { prepareReaction, collectResources, boostLabs } from 'job/lab';
import dumpResources from 'job/dumpResources';

function findJob(creep: LabManager) {
  const roomMemory = creep.room.memory
  creep.memory.state = IDLE
  const lab1 = creep.room.lab1
  const lab2 = creep.room.lab2
  const terminal = creep.room.terminal
  if (!lab1 || !lab2) return false
  if (!terminal) return false
  const allLabs = creep.room.externalLabs.concat(lab1, lab2)
  if (roomMemory.labState === LAB_PENDING && roomMemory.labRecipe) {
    return prepareReaction(lab1, lab2, terminal, roomMemory, creep)
  } else if (roomMemory.labState === LAB_COLLECTING) {
    if (collectResources(creep, allLabs)) return true
    roomMemory.labState = IDLE
    handleLab(terminal)
  } else if (roomMemory.labState === LAB_BOOSTING && roomMemory.boost) {
    if (boostLabs(creep, allLabs, terminal, roomMemory.boost)) return true
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
      dumpResources(creep, HAUL_LAB_TO_STORAGE)
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
