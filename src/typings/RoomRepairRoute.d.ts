declare class RoomRepairRoute {
  findSources(): AnyStoreStructure[]
  validateSource(s: AnyStoreStructure): boolean
  findTargets(): Structure<BuildableStructureConstant>[]
}
