import enemies from '../../config/enemies'

export const hittable = (obj: Creep | Structure) => obj.hits

export function findTargetCreeps(
  creep: Creep,
  filter?: (creep: Creep) => boolean,
) {
  return creep.room.findHostileCreeps(filter)
}

export function findTargetCreep(
  creep: Creep,
  filter?: (creep: Creep) => boolean,
) {
  const targets = findTargetCreeps(creep, filter)
  return creep.pos.findClosestByPath(targets, { maxRooms: 1 })
}

export function findTargetStructure(
  creep: Creep,
  ranged = false,
  filter?: (creep: Structure) => boolean,
) {
  const list = enemies.allies
  const lastFiler = filter || (() => true)
  const minRange = ranged ? 3 : 1
  let newTarget: Structure | null = creep.pos.findClosestByPath(
    FIND_HOSTILE_STRUCTURES,
    {
      filter: (s) =>
        !list[s.owner ? s.owner.username : ''] &&
        hittable(s) &&
        s.structureType !== STRUCTURE_STORAGE &&
        s.structureType !== STRUCTURE_TERMINAL &&
        s.structureType !== STRUCTURE_POWER_BANK &&
        s.structureType !== STRUCTURE_RAMPART &&
        lastFiler(s),
      range: minRange,
      maxRooms: 1,
    },
  )
  const roomOwner = creep.room.owner
  if (!newTarget && (!creep.room.my || !roomOwner || !list[roomOwner]))
    newTarget =
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          hittable(s) &&
          s.structureType !== STRUCTURE_POWER_BANK &&
          s.structureType !== STRUCTURE_ROAD &&
          s.structureType !== STRUCTURE_CONTAINER &&
          lastFiler(s),
        range: minRange,
        maxRooms: 1,
      }) ||
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_RAMPART && lastFiler(s),
        range: minRange,
        maxRooms: 1,
      })
  return newTarget
}

export function findTarget(
  creep: Creep,
  ranged = false,
  filter?: (creep: Creep | Structure) => boolean,
) {
  let newTarget: Creep | Structure | null = findTargetStructure(
    creep,
    ranged,
    filter,
  )
  if (!newTarget) {
    return findTargetCreep(creep, filter)
  }
  return newTarget
}
