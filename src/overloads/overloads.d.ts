interface BoostInfo {
  resource: ResourceConstant
  partCount: number
}

type BuildingAt<T extends StructureConstant> = (
  charCode: number,
  type: T,
) => Structure<T> | undefined
interface Room {
  factory?: StructureFactory
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  allLabs: StructureLab[]
  mineral?: Mineral
  extractor?: StructureExtractor
  filled: boolean
  linked: boolean
  spawn?: StructureSpawn
  powerSpawn?: StructurePowerSpawn
  cache: RoomCache
  factoryCache: FactoryCache
  powerSpawnCache: PowerSpawnCache
  sources: SourceHandler
  _sourceHandler?: SourceHandler
  my: boolean
  shieldPositions: RoomPosition[]

  addBuilding: (x: number, y: number, order?: number) => void
  removeBuilding: (x: number, y: number) => void
  setBuilding: (x: number, y: number, order: number) => void
  setBuildingOrder: (x: number, y: number, order: number) => void
  moveBuilding: (x1: number, y1: number, x2: number, y2: number) => void

  buildingAt: BuildingAt<StructureConstant>
  getBoosts: () => BoostData
  getAmountReserved: (resource: ResourceConstant) => number
  getAvailableBoosts: (resource: ResourceConstant, partCount: number) => number
  getBestAvailableBoost: (
    partType: string,
    action: string,
    partCount: number,
  ) => BoostInfo | null
  getBoostRequest: (creepName: string) => Id<StructureLab> | undefined
  createBoostRequest: (
    creepName: string,
    resource: ResourceConstant,
    partCount: number,
    mandatory?: boolean,
  ) => void
  clearBoostRequest: (
    creepName: string,
    resource: ResourceConstant | null,
    done?: boolean,
  ) => void
  prepareBoostData: (
    creepMemory: CreepMemory,
    parts: BodyPartConstant[],
    actions: string[],
    body: BodyPartConstant[],
  ) => BoostInfo[]
  store: (resource: ResourceConstant) => number
  positionFromChar: (char: string) => RoomPosition
  labsFromChars: (char: string) => StructureLab[]
}

interface Structure {
  isWalkable: boolean
}

interface StructureLab {
  shouldRunReaction: (resource: ResourceConstant, labIndex: number) => boolean
}

interface StructureSpawn {
  getDirections: () => DirectionConstant[]
  trySpawnCreep: (
    body: BodyPartConstant[],
    letter: string,
    toMemory: CreepMemory,
    retry?: boolean,
    cooldown?: number,
    boost?: BoostInfo[],
  ) => ScreepsReturnCode
  cache: SpawnCache
  distanceToController: number
}

interface StructurePowerSpawn {
  cache: PowerSpawnCache
}

interface StructureFactory {
  cache: FactoryCache
}

interface StructureTerminal {
  cache: TerminalCache
  businessHandler: BusinessHandler
}

type Building<T extends StructureConstant> = (
  type: T,
) => Structure<T> | undefined
interface RoomPosition {
  rangeXY: (x: number, y: number) => number
  range: (pos: RoomPosition) => number
  rangeTo: (obj: _HasRoomPosition) => number
  building: Building<StructureConstant>
}

interface Creep {
  motherRoom: Room
  workpartCount: number
  cache: CreepCache
  isRetired: boolean
  hasActiveAttackBodyPart: boolean
  safeDistance: number
  _bodyPartHitThreshold: Record<BodyPartConstant, number>
  routeProcessor: ResourceRouteProcessor
  hasActiveBodyPart: (b: BodyPartConstant) => boolean
  isSafeFrom: (creep: Creep) => boolean
  safeRangeXY: (x: number, y: number) => number
}
