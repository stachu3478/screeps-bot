interface Room {
  factory?: StructureFactory
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  mineral?: Mineral
  extractor?: StructureExtractor
}
