StructureLab.prototype.shouldRunReaction = function (
  resource: ResourceConstant,
  labIndex: number,
) {
  if (this.mineralType) return true
  const labBoostData = this.room.boosts.labs[labIndex]
  if (!labBoostData) return true
  const [resourceType, amount] = labBoostData
  return !amount || resourceType === resource
}
