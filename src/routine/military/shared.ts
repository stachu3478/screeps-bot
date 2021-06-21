import enemies from '../../config/enemies'
import attack from '../../config/attack'

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

export function findTargetStructures(
  creep: Creep,
  filter = (s: Structure) => true,
) {
  const allies = enemies.allies
  return creep.room
    .find(FIND_STRUCTURES)
    .filter((s) => {
      if (s.my) {
        return false
      }
      const owner = s.owner
      if (owner && allies[owner.username]) {
        return false
      }
      if (!hittable(s)) {
        return false
      }
      if (!filter(s)) {
        return false
      }
      return attack.structurePriority[s.structureType]
    })
    .sort(
      (a, b) =>
        (attack.structurePriority[b.structureType] || 0) -
        (attack.structurePriority[a.structureType] || 0),
    )
}

export function findTargetStructure(
  creep: Creep,
  ranged = false,
  filter = (s: Structure) => true,
) {
  const targets = findTargetStructures(creep, filter)
  const minRange = ranged ? 3 : 1
  return (
    creep.pos.findClosestByPath(targets, {
      filter: (s) =>
        hittable(s) &&
        s.structureType !== STRUCTURE_RAMPART &&
        s.structureType !== STRUCTURE_WALL &&
        s.structureType !== STRUCTURE_ROAD &&
        s.structureType !== STRUCTURE_CONTAINER &&
        filter(s),
      range: minRange,
      maxRooms: 1,
    }) ||
    creep.pos.findClosestByPath(targets, {
      filter: (s) =>
        (s.structureType === STRUCTURE_RAMPART ||
          s.structureType === STRUCTURE_WALL) &&
        filter(s),
      range: minRange,
      maxRooms: 1,
    })
  )
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

export function findTargets(
  creep: Creep,
  filter?: (creep: Creep | Structure) => boolean,
) {
  const targets: (Creep | Structure)[] = []
  return targets
    .concat(findTargetStructures(creep, filter))
    .concat(findTargetCreeps(creep, filter))
}
