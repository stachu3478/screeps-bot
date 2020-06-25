import { SUCCESS, NOTHING_TODO, FAILED, NO_RESOURCE } from '../../constants/response'
import { findCloseMostDamagedStructure } from 'utils/find';

interface AutoRepairCreep extends Creep {
  memory: AutoRepairMemory
}

interface AutoRepairMemory extends CreepMemory {
  _repair_cooldown?: number
  _auto_repair?: Id<Structure>
}

export default function autoRepair(creep: AutoRepairCreep, timeout: number = 6) {
  const mem = creep.memory
  if ((mem._repair_cooldown || 0) > 0) {
    mem._repair_cooldown = (mem._repair_cooldown || 0) - 1
    return NOTHING_TODO
  }
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  let target = mem._auto_repair && Game.getObjectById(mem._auto_repair)
  if (!target || target.hits === target.hitsMax || creep.pos.rangeTo(target) > 3) {
    const repairPower = creep.workpartCount * REPAIR_POWER
    target = findCloseMostDamagedStructure(creep.pos, repairPower)
    if (!target) {
      mem._repair_cooldown = timeout
      return NOTHING_TODO
    }
    mem._auto_repair = target.id
  }
  const result = creep.repair(target)
  const remaining = storedEnergy - creep.workpartCount
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) {
      delete mem._auto_repair
      return NO_RESOURCE
    }
    return SUCCESS
  }
}
