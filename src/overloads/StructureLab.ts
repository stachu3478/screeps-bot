StructureLab.prototype.shouldRunReaction = function (resource: ResourceConstant, labIndex: number) {
  if (this.mineralType) return true
  const boosts = this.room.getBoosts()
  const reservedResourceType = boosts.resources.labs[labIndex]
  if (!reservedResourceType || reservedResourceType === resource || !boosts.amounts.labs[labIndex]) return true
  return false
}
