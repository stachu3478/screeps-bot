interface BoostInfo {
  resource: ResourceConstant
  partCount: number
}

type BuildingAt<T extends StructureConstant> = (
  charCode: number,
  type: T,
) => Structure<T> | undefined
interface Room {
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  mineral?: Mineral
  spawnLink?: StructureLink
  linked: boolean
  spawn?: StructureSpawn
  cache: RoomCache
  factoryCache: FactoryCache
  powerSpawnCache: PowerSpawnCache
  sources: SourceHandler
  _sourceHandler?: SourceHandler
  my: boolean
  shieldPositions: RoomPosition[]
  defencePolicy: DefencePolicy
  buildingRouter: RoomBuildingRouter
  repairRouter: RoomRepairRouter
  leastAvailablePosition: RoomPosition
  location: RoomLocation
  pathScanner: RoomPathScanner
  owner?: string
  enemyDetector: EnemyRoomDetector
  boosts: BoostManager
  buildings: RoomBuildings
  duet: DuetHandler

  addBuilding: (x: number, y: number, order?: number) => void
  removeBuilding: (x: number, y: number) => void
  setBuilding: (x: number, y: number, order: number) => void
  setBuildingOrder: (x: number, y: number, order: number) => void
  moveBuilding: (x1: number, y1: number, x2: number, y2: number) => void

  buildingAt: BuildingAt<StructureConstant>
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
  isBorder: () => boolean
  building: Building<StructureConstant>
}

interface Creep {
  motherRoom: Room
  cache: CreepCache
  isRetired: boolean
  routeProcessor: ResourceRouteProcessor
  buildingRouteProcessor: BuildingRouteProcessor
  repairRouteProcessor: RepairRouteProcessor
  corpus: CreepCorpus
  isSafeFrom: (creep: Creep) => boolean
  safeRangeXY: (x: number, y: number) => number
  moveToRoom: (room: string) => ScreepsReturnCode
}

interface StructureTower {
  attackPowerAt: (creep: _HasRoomPosition) => number
}
