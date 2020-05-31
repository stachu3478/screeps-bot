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

  isBoosting: () => boolean
  reserveBoost: (name: string, type: ResourceConstant, amount: number) => boolean
  unreserveBoost: (name: string, type?: ResourceConstant) => void
  getBoost: (creep: Creep) => BoostingData | undefined
}

interface StructureSpawn {
  getDirections: () => DirectionConstant[]
}
