StructureLab.prototype.shouldRunReaction = function (resource: ResourceConstant, labIndex: number) {
  if (this.mineralType) return true
  const labBoostData = this.room.getBoosts().labs[labIndex]
  if (!labBoostData) return true
  const [resourceType, amount] = labBoostData
  return !amount || resourceType === resource
}
