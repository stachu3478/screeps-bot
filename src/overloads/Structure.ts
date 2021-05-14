import defineGetter from 'utils/defineGetter'

function defineStructureGetter<T extends keyof Structure>(
  property: T,
  handler: (self: Structure) => Structure[T],
) {
  defineGetter<Structure, StructureConstructor, T>(Structure, property, handler)
}

export function isWalkable(self: Structure) {
  return (
    (self.structureType === STRUCTURE_RAMPART &&
      ((self as StructureRampart).my || (self as StructureRampart).isPublic)) ||
    self.structureType === STRUCTURE_ROAD ||
    self.structureType === STRUCTURE_CONTAINER
  )
}
defineStructureGetter('isWalkable', isWalkable)
