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
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(mem._auto_repair || ('' as Id<Structure>))
  if (!target || target.hits === target.hitsMax || creep.pos.getRangeTo(target) > 3) {
    const repairPower = creep.getActiveBodyparts(WORK) * REPAIR_POWER
    target = findCloseMostDamagedStructure(creep.pos, repairPower)
    if (!target) {
      mem._repair_cooldown = timeout
      return NOTHING_TODO
    }
    mem._auto_repair = target.id
  }
  const result = creep.repair(target)
  const remaining = creep.store[RESOURCE_ENERGY] - creep.getActiveBodyparts(WORK)
  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
}
