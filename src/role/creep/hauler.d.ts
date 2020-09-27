export default interface Hauler extends Creep {
  memory: HaulerMemory
  cache: HaulerCache
}

interface HaulerMemory extends CreepMemory {
  _arrive?: string
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
  _draw?: Id<
    Ruin | Tombstone | StructureStorage | StructureTerminal | StructureContainer
  >
  _drawType?: ResourceConstant
}

interface HaulerCache extends CreepCache {
  pick?: Id<Resource>
}
