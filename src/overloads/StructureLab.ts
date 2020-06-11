import { findCloseMostDamagedStructure } from "utils/find";

StructureLab.prototype.shouldRunReaction = function (resource: ResourceConstant, labIndex: number) {
  if (this.mineralType) return true
  const reservedResourceType = this.room.getBoosts().resources.labs[labIndex]
  if (!reservedResourceType || reservedResourceType === resource) return true
  return false
}
