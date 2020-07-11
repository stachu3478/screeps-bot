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
  [Keys.toughHitsThreshold]?: number
  [Keys.attackHitsThreshold]?: number
}

function getHitThreshold(creep: Creep, type: BodyPartConstant) {
  return creep.body.reverse().findIndex(part => part.type === type) * 100
}

const hasPart = (type: BodyPartConstant, property: Keys) => (creep: AttackCreep) => {
  const memory = creep.memory
  const threshold = memory[property]
  if (threshold)
    return creep.hits > threshold
  return creep.hits > (memory[property] = getHitThreshold(creep, type))
}
export const hasToughPart = hasPart(TOUGH, Keys.toughHitsThreshold)
export const hasAttackPart = hasPart(ATTACK, Keys.attackHitsThreshold)

export default function attack(creep: AttackCreep) {
  let target: Creep | Structure | null = Game.getObjectById(creep.memory._attack || "")
  if (hasToughPart(creep)) return FAILED
  if (!target) {
    const list = Memory.whitelist || {}
    let newTarget: Creep | Structure | null = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
      filter: s => !list[s.owner ? s.owner.username : ''] && hittable(s) && s.structureType !== STRUCTURE_STORAGE && s.structureType !== STRUCTURE_TERMINAL
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
    creep.moveTo(target)
    return NOTHING_DONE
  }
  if (creep.hits === creep.hitsMax) {
    if (creep.attack(target) !== 0) return FAILED
  }
  else creep.heal(creep)
  return SUCCESS
}
