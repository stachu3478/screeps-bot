import RangedAttackPlanner from 'planner/military/RangedAttackPlanner'

export default function memoryLessAutoRangedAttack(creep: Creep) {
  return new RangedAttackPlanner(creep.room, creep.pos).apply(creep)
}
