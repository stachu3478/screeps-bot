import _ from 'lodash'
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

defineStructureGetter('effectiveHits', (self) => {
  if (self.structureType === STRUCTURE_RAMPART) return self.hits
  const rampart = self.pos.building(STRUCTURE_RAMPART)
  const ranpartHits = rampart ? rampart.hits : 0
  const baseHits = self.hits || 0
  return baseHits + ranpartHits
})

defineStructureGetter('owner', (self) => {
  const username = self.room.owner
  if (_.isUndefined(username)) {
    return
  }
  return { username: username as string }
})

defineStructureGetter('my', (self) => {
  return self.room.my
})

Structure.prototype.onTransfer = _.noop
Structure.prototype.onWithdraw = _.noop
