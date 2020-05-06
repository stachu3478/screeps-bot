import { SUCCESS, NOTHING_TODO, FAILED, NO_RESOURCE } from '../../constants/response'

interface ToRepair {
  [key: string]: number
}
const toRepair: ToRepair = {
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_WALL]: 1,
  [STRUCTURE_RAMPART]: 1,
  [STRUCTURE_CONTAINER]: 1,
}
export default function autoRepair(creep: Creep, timeout: number = 6) {
  const mem = creep.memory
  if ((mem._repair_cooldown || 0) > 0) {
    mem._repair_cooldown = (mem._repair_cooldown || 0) - 1
    return NOTHING_TODO
  }
  if (creep.store[RESOURCE_ENERGY] === 0) return NO_RESOURCE
  let target = Game.getObjectById(mem._auto_repair || ('' as Id<Structure>))
  const repairPower = creep.getActiveBodyparts(WORK) * REPAIR_POWER
  if (!target || target.hits === target.hitsMax || creep.pos.getRangeTo(target) > 3) {
    target = creep.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: s => toRepair[s.structureType]
        && s.hits + repairPower <= s.hitsMax
    })[0]
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
