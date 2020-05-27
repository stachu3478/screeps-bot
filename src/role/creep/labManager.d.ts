export interface LabManager extends Creep {
  memory: LabManagerMemory
}

interface LabManagerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
  _targetLab?: Id<StructureLab>
}
