import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

interface ToRepair {
  [key: string]: number
}
const toRepair: ToRepair = {
  [STRUCTURE_SPAWN]: 1,
  [STRUCTURE_EXTENSION]: 1,
  [STRUCTURE_TOWER]: 1,
  [STRUCTURE_STORAGE]: 1,
  [STRUCTURE_TERMINAL]: 1
}

interface RepairCreep extends Creep {
  memory: RepairMemory
}

interface RepairMemory extends CreepMemory {
  _repair?: Id<Structure>
}

export default function repair(creep: RepairCreep) {
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  const motherRoom = creep.motherRoom
  if (motherRoom.memory.repaired) return NOTHING_TODO
  let target = creep.memory._repair && Game.getObjectById(creep.memory._repair)
  const repairPower = creep.getActiveBodyparts(WORK) * REPAIR_POWER
  if (!target || target.hits === target.hitsMax) {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => toRepair[s.structureType]
        && s.hits + repairPower <= s.hitsMax
    })
    if (!target) {
      motherRoom.memory.repaired = 1
      return NOTHING_TODO
    }
    creep.memory._repair = target.id
  }
  const result = creep.repair(target)
  const remaining = creep.store[RESOURCE_ENERGY] - creep.getActiveBodyparts(WORK)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target, false, 3)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
