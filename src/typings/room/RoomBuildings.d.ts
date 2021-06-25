declare class RoomBuildings {
  get<T>(
    ...types: (T & StructureConstant)[]
  ): ConcreteStructure<T & StructureConstant>[]
  find<T>(
    type: T & StructureConstant,
  ): ConcreteStructure<T & StructureConstant>[]
  findOne<T>(
    type: T & StructureConstant,
  ): ConcreteStructure<T & StructureConstant> | undefined
  factory?: StructureFactory
  labs: StructureLab[]
  extractor?: StructureExtractor
  powerSpawn?: StructurePowerSpawn
  spawnsWithExtensions: (StructureSpawn | StructureExtension)[]
  observer?: StructureObserver
  towers: StructureTower[]
  spawns: StructureSpawn[]
  extensions: StructureExtension[]
  nuker?: StructureNuker
  links: StructureLink[]
  invaderCore?: StructureInvaderCore
  roads: StructureRoad[]
  containers: StructureContainer[]
}
