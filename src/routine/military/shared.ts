const hittable = (obj: Creep | Structure) => obj.hits
const hittableFilter = {
  filter: hittable,
}

export function findTarget(creep: Creep, ranged = false) {
  const list = Memory.whitelist || {}
  let newTarget: Creep | Structure | null = creep.pos.findClosestByPath(
    FIND_HOSTILE_STRUCTURES,
    {
      filter: (s) =>
        !list[s.owner ? s.owner.username : ''] &&
        hittable(s) &&
        s.structureType !== STRUCTURE_STORAGE &&
        s.structureType !== STRUCTURE_TERMINAL,
      range: ranged ? 3 : 1,
    },
  )
  if (!newTarget)
    newTarget = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
      filter: (c) => !list[c.owner.username] && hittable(c),
    })
  if (!newTarget)
    newTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, hittableFilter)
  return newTarget
}
