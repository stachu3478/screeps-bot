import { SUCCESS, NOTHING_DONE } from "constants/response";

interface HealCreep extends Creep {
  memory: HealMemory
}

interface HealMemory extends CreepMemory { }

export default function heal(creep: HealCreep) {
  const nearest = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: creep => creep.hits < creep.hitsMax
  })
  if (nearest) {
    let result
    if (creep.pos.isNearTo(nearest)) {
      result = creep.heal(nearest)
    }
    result = creep.rangedHeal(nearest)
    if (result === 0) return SUCCESS
  }
  return NOTHING_DONE
}
