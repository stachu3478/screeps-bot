import lab from "role/lab";

StructureLab.prototype.shouldRunReaction = function (resource: ResourceConstant, labIndex: number) {
  if (this.mineralType) return true
  const labBoostData = this.room.getBoosts().labs[labIndex]
  const [resourceType, amount] = labBoostData
  if (!labBoostData || !amount || resourceType === resource) return true
  return false
}
