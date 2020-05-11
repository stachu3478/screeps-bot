import { cheapMove } from "utils/path";
import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from "constants/response";

const hittable = (obj: Creep | Structure) => obj.hits
const hittableFilter = {
  filter: hittable
}

interface AttackCreep extends Creep {
  memory: AttackMemory
}

interface AttackMemory extends CreepMemory {
  _attack?: Id<Creep | Structure>
}

export default function attack(creep: AttackCreep) {
  let target: Creep | Structure | null = Game.getObjectById(creep.memory._attack || "")
  if (creep.getActiveBodyparts(TOUGH) === 0) return FAILED
  if (!target) {
    const list = Memory.whitelist || {}
    let newTarget: Creep | Structure | null = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
      filter: s => !list[s.owner ? s.owner.username : ''] && hittable(s)
    })
    if (!newTarget) newTarget = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
      filter: c => !list[c.owner.username] && hittable(c)
    })
    if (!newTarget) newTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, hittableFilter)
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
