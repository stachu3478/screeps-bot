import { IDLE, BOOST } from 'constants/state'
import { NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import profiler from "screeps-profiler"
import boost from 'routine/boost';

export interface Booster extends Creep {
  memory: BoosterMemory
}

export interface BoosterMemory extends CreepMemory {
  _boostLab?: Id<StructureLab>
  _targetRole: number
}

function findJob(creep: Booster) {
  creep.memory.state = IDLE
  const boostData = creep.room.getBoost(creep)
  if (!boostData) return false
  const lab = creep.room.allLabs.find(lab => lab.mineralType === boostData.type)
  if (!lab) {
    creep.room.unreserveBoost(creep.name, boostData.type)
    return false
  }
  creep.memory._boostLab = lab.id
  return true
}

export default profiler.registerFN(function labManager(creep: Booster) {
  switch (creep.memory.state) {
    case IDLE:
      if (findJob(creep)) break
      creep.memory.role = creep.memory._targetRole
      break
    case BOOST:
      if (!creep.memory._boostLab) {
        creep.memory.state = IDLE
        break
      }
      const lab = Game.getObjectById(creep.memory._boostLab)
      switch (boost(creep)) {
        case SUCCESS:
        case FAILED:
          creep.room.unreserveBoost(creep.name, lab && lab.mineralType || undefined)
        case NOTHING_TODO:
          creep.memory.state = IDLE
      }
      break
    default: findJob(creep)
  }
}, 'roleBooster')
