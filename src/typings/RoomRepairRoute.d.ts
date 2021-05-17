declare class RoomRepairRoute {
  findSources(): AnyStoreStructure[]
  validateSource(s: AnyStoreStructure): boolean
  findTargets(): Structure<BuildableStructureConstant>[]
  choose(
    pos: RoomPosition,
    opts?: FindPathOpts,
  ): Structure<BuildableStructureConstant> | null
}
