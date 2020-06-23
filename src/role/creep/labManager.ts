import State from 'constants/state'
import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw';
import fill from 'routine/haul/fill';
import profiler from "screeps-profiler"
import Role from 'constants/role';
import handleLab from 'utils/handleLab';
import { LabManager } from './labManager.d'
import labJobs from 'job/lab';
import dumpResources from 'job/dumpResources';
import { getFillableGenericStruture } from 'utils/fill';

export function findJob(creep: LabManager) {
  const roomMemory = creep.room.memory
  creep.memory.state = State.IDLE
  const lab1 = creep.room.lab1
  const lab2 = creep.room.lab2
  const terminal = creep.room.terminal
  const externalLabs = creep.room.externalLabs
  if (labJobs.prepareBoostResources(creep, externalLabs)) return true
  if (!lab1 || !lab2) return false
  if (!terminal) return false
  const allLabs = externalLabs.concat(lab1, lab2)
  if (roomMemory.labState === State.LAB_PENDING) {
    return labJobs.prepareReaction(lab1, lab2, terminal, roomMemory, creep)
  } else if (roomMemory.labState === State.LAB_COLLECTING) {
    if (labJobs.collectResources(creep, allLabs)) return true
    roomMemory.labState = State.IDLE
    handleLab.run(terminal)
  }
  return false
}

export default profiler.registerFN(function labManager(creep: LabManager) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (findJob(creep)) break
      if (creep.store.getUsedCapacity() === 0) {
        creep.memory.role = Role.FACTORY_MANAGER
        break
      }
      dumpResources(creep, State.HAUL_LAB_TO_STORAGE)
      break
    case State.HAUL_LAB_FROM_STORAGE:
      switch (draw(creep)) {
        case DONE: case SUCCESS:
          const labId = creep.memory._targetLab
          if (labId) {
            creep.memory._fill = creep.memory._targetLab
            creep.memory.state = State.HAUL_STORAGE_TO_LAB
          } else creep.memory.state = State.HAUL_LAB_TO_STORAGE
          break
        case NOTHING_TODO: case FAILED: creep.memory.state = State.IDLE; break
      }
      break
    case State.HAUL_STORAGE_TO_LAB:
      switch (fill(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.IDLE; break
        case NOTHING_TODO: case FAILED:
          const storage = getFillableGenericStruture(creep.room, creep.store.getUsedCapacity())
          if (!storage) break
          creep.memory._fill = storage.id
          creep.memory.state = State.HAUL_LAB_TO_STORAGE
          break
      }
      break
    case State.HAUL_STORAGE_FROM_LAB:
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          const storage = getFillableGenericStruture(creep.room, creep.store.getUsedCapacity())
          if (storage) {
            creep.memory._fill = storage.id
            creep.memory.state = State.HAUL_LAB_TO_STORAGE
          } else creep.memory.state = State.HAUL_STORAGE_TO_LAB
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = State.IDLE; break
      }
      break
    case State.HAUL_LAB_TO_STORAGE:
      switch (fill(creep)) {
        case DONE: case SUCCESS: creep.memory.state = State.IDLE; break
        case NOTHING_TODO: case FAILED:
          if (creep.memory._fillType) creep.drop(creep.memory._fillType)
          creep.memory.state = State.IDLE
          break
      }
      break
    default: findJob(creep)
  }
}, 'roleLabManager')
