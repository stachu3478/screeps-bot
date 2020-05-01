import { cheapMove } from "utils/path";
import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from "constants/response";

const hittable = {
  filter: (obj: Creep | Structure) => obj.hits
}

export default function attack(creep: Creep) {
  let target: Creep | Structure | null = Game.getObjectById(creep.memory._attack || "")
  if (creep.getActiveBodyparts(TOUGH) === 0) return FAILED
  if (!target) {
    let newTarget: Creep | Structure | null = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, hittable)
    if (!newTarget) newTarget = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, hittable)
    if (!newTarget) newTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, hittable)
    if (!newTarget) return NOTHING_TODO
    creep.memory._attack = newTarget.id
    target = newTarget
  }
  if (!creep.pos.isNearTo(target)) {
    cheapMove(creep, target)
    return NOTHING_DONE
  }
  if (creep.hits === creep.hitsMax) {
    if (creep.attack(target) !== 0) return FAILED
  }
  else creep.heal(creep)
  return SUCCESS
}
