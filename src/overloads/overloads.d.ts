interface BoostInfo {
  resource: ResourceConstant
  partCount: number
}

interface BoostKeys {

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

  addBuilding: (x: number, y: number, order?: number) => void
  removeBuilding: (x: number, y: number) => void
  setBuilding: (x: number, y: number, order: number) => void
  setBuildingOrder: (x: number, y: number, order: number) => void
  moveBuilding: (x1: number, y1: number, x2: number, y2: number) => void

  getBoosts: () => BoostData
  getAmountReserved: (resource: ResourceConstant) => number
  getAvailableBoosts: (resource: ResourceConstant, partCount: number) => number
  getBestAvailableBoost: (partType: string, action: string, partCount: number) => BoostInfo | null
  getBoostRequest: (creepName: string) => Id<StructureLab> | undefined
  createBoostRequest: (creepName: string, resource: ResourceConstant, partCount: number) => void
  clearBoostRequest: (creepName: string, resource: ResourceConstant | null) => void
  prepareBoostData: (creepMemory: CreepMemory, parts: BodyPartConstant[], actions: string[], body: BodyPartConstant[]) => BoostInfo[]
}

interface StructureLab {
  shouldRunReaction: (resource: ResourceConstant, labIndex: number) => boolean
}

interface StructureSpawn {
  getDirections: () => DirectionConstant[]
  trySpawnCreep: (body: BodyPartConstant[], name: string, memory: CreepMemory, retry?: boolean, cooldown?: number, boost?: BoostInfo[]) => ScreepsReturnCode
}

interface RoomPosition {
  rangeXY: (x: number, y: number) => number
  range: (pos: RoomPosition) => number
  rangeTo: (obj: _HasRoomPosition) => number
}
