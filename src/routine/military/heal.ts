import { SUCCESS, NOTHING_DONE } from "constants/response";

export default function heal(creep: Creep) {
  /*const target = Game.creeps[creep.memory._heal || ""]
  if (!target || target.hits === target.hitsMax) {
    const newTarget = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: creep => creep.hits < creep.hitsMax
    })
  }*/

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
