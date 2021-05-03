export default interface Hauler extends Creep {
  memory: HaulerMemory
  cache: HaulerCache
}

interface HaulerMemory extends CreepMemory {
  _arrive?: string
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
  _draw?: Id<
    Ruin | Tombstone | StructureStorage | StructureTerminal | StructureContainer
  >
  _drawType?: ResourceConstant
}

interface HaulerCache extends CreepCache {
  pick?: Id<Resource>
}
