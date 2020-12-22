const hittable = (obj: Creep | Structure) => obj.hits

export function findTarget(
  creep: Creep,
  ranged = false,
  filter?: (creep: Creep | Structure) => boolean,
) {
  const list = Memory.whitelist || {}
  const lastFiler = filter || (() => true)
  let newTarget: Creep | Structure | null = creep.pos.findClosestByPath(
    FIND_HOSTILE_STRUCTURES,
    {
      filter: (s) =>
        !list[s.owner ? s.owner.username : ''] &&
        hittable(s) &&
        s.structureType !== STRUCTURE_STORAGE &&
        s.structureType !== STRUCTURE_TERMINAL &&
        s.structureType !== STRUCTURE_POWER_BANK &&
        lastFiler(s),
      range: ranged ? 3 : 1,
    },
  )
  if (!newTarget)
    newTarget = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
      filter: (c) => !list[c.owner.username] && hittable(c) && lastFiler(c),
    })
  if (!newTarget)
    newTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        hittable(s) &&
        s.structureType !== STRUCTURE_POWER_BANK &&
        s.structureType !== STRUCTURE_ROAD &&
        s.structureType !== STRUCTURE_CONTAINER &&
        lastFiler(s),
    })
  return newTarget
}
