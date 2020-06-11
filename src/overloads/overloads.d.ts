interface Room {
  factory?: StructureFactory
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  allLabs: StructureLab[]
  mineral?: Mineral
  extractor?: StructureExtractor
  filled: boolean

  addBuilding: (x: number, y: number, order?: number) => void
  removeBuilding: (x: number, y: number) => void
  setBuilding: (x: number, y: number, order: number) => void
  setBuildingOrder: (x: number, y: number, order: number) => void
  moveBuilding: (x1: number, y1: number, x2: number, y2: number) => void

  getBoosts: () => BoostData
  getAmountReserved: (resource: ResourceConstant) => number
  getAvailableBoosts: (resource: ResourceConstant, partCount: number) => number
}

interface StructureLab {
  shouldRunReaction: (resource: ResourceConstant, labIndex: number) => boolean
}

interface StructureSpawn {
  getDirections: () => DirectionConstant[]
}
