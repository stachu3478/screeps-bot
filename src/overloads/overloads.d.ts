interface BoostingData {
  type: ResourceConstant,
  amount: number
}

interface Room {
  factory?: StructureFactory
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  allLabs: StructureLab[]
  mineral?: Mineral
  extractor?: StructureExtractor
  filled: boolean
}

interface StructureSpawn {
  getDirections: () => DirectionConstant[]
}
