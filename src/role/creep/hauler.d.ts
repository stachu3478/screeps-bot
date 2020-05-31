export default interface Hauler extends Creep {
  memory: HaulerMemory
}

interface HaulerMemory extends CreepMemory {
  _arrive?: string
  _pick?: Id<Resource>
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
  _draw?: Id<Ruin | Tombstone | StructureStorage | StructureTerminal>
  _drawType?: ResourceConstant
  _tmp?: 0 | 1
}
