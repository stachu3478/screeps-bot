interface BoostInfo {
  resource: ResourceConstant
  partCount: number
}

interface Room {
  lab1?: StructureLab
  lab2?: StructureLab
  externalLabs: StructureLab[]
  mineral?: Mineral
  links: RoomLinks
  spawn?: StructureSpawn
  cache: RoomCache
  factoryCache: FactoryCache
  powerSpawnCache: PowerSpawnCache
  sources: SourceHandler
  my: boolean
  positions: RoomPositions
  defencePolicy: DefencePolicy
  buildingRouter: RoomBuildingRouter
  repairRouter: RoomRepairRouter
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

  buildingAt<T extends StructureConstant>(
    charCode: number,
    type: T,
  ): ConcreteStructure<T> | undefined
  buildingAtXY<T extends StructureConstant>(
    x: number,
    y: number,
    type: T,
  ): ConcreteStructure<T> | undefined
  store: (resource: ResourceConstant) => number
  totalStore: (resource: ResourceConstant) => number
  positionFromChar: (char: string) => RoomPosition
  labsFromChars: (char: string) => StructureLab[]
  findHostileCreeps: (filter?: (s: Creep) => boolean) => Creep[]
  findHostilePowerCreeps: (filter?: (s: PowerCreep) => boolean) => PowerCreep[]
}

interface Structure {
  isWalkable: boolean
  effectiveHits: number
  onWithdraw: (amount: number) => void
  onTransfer: (amount: number) => void
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
  effectiveHits: number
}

interface StructurePowerSpawn {
  cache: PowerSpawnCache
}

interface StructureFactory {
  cache: FactoryCache
  router: FactoryRouter
}

interface StructureTerminal {
  cache: TerminalCache
  businessHandler: BusinessHandler
}

interface RoomPosition {
  offset: (direction: DirectionConstant) => RoomPosition
  rangeXY: (x: number, y: number) => number
  range: (pos: RoomPosition) => number
  rangeTo: (obj: _HasRoomPosition) => number
  isBorder: () => boolean
  building<T extends StructureConstant>(
    type: T,
  ): ConcreteStructure<T> | undefined
  disbordered(): RoomPosition
  lookForAtInRange<T extends keyof AllLookAtTypes>(
    type: T,
    range: number,
  ): LookForAtAreaResultArray<AllLookAtTypes[T], T>
  isWalkable: boolean
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
  _transfer: Creep['transfer']
  _withdraw: Creep['withdraw']
  _rangedHeal: Creep['rangedHeal']
  onWithdraw: (amount: number) => void
  onTransfer: (amount: number) => void
  dismantleOrAttack: (
    target: Structure<StructureConstant> | AnyCreep,
  ) => ScreepsReturnCode
}

interface PowerCreep {
  onWithdraw: (amount: number) => void
  onTransfer: (amount: number) => void
}

interface StructureTower {
  attackPowerAt: (creep: _HasRoomPosition, assumeEnergy?: boolean) => number
}

interface StructureNuker {
  readyToLaunch: boolean
}

interface StructureLink {
  cache: LinkCache
}

interface Tombstone {
  onWithdraw: (amount: number) => void
}

interface Ruin {
  onWithdraw: (amount: number) => void
}

interface RoomVisual {
  info: (text: string, x: number, y: number) => void
  danger: (text: string, x: number, y: number) => void
}
