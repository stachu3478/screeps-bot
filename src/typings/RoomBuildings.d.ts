declare class RoomBuildings {
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
}
