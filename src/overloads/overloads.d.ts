interface Room {
  factory?: StructureFactory
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  mineral?: Mineral
  extractor?: StructureExtractor

  isBoosting: () => boolean
  reserveBoost: (creep: Creep, type: ResourceConstant, amount: number) => boolean
  unreserveBoost: (name: string) => void
}
