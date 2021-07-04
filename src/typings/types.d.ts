interface SourceMap {
  [id: string]: string
}

type RouteStatus = [number, number, number]
// memory extension samples
interface CreepMemory {
  role: Role
  newRole?: number
  room: string
  state?: State
  _move?: {
    path: string
    dest: {
      room: string
      x: number
      y: number
    }
    t?: number
  }
  deprivity: number
  /**
   * Last room where the creep was
   */
  r?: string // last room
  /**
   * Last ticks to live that the creep had
   */
  l?: number
  /**
   * Current resource route status that is processed by the creep
   */
  s?: RouteStatus
  /**
   * Current building route status that is processed by the creep
   */
  c?: RouteStatus
  /**
   * Creep room path step
   */
  R?: [string, string, RoomNeighbourPath]

  mine?: Lookup<RoomPosition>
  reserve?: string
  collect?: Lookup<RoomPosition>
}

interface Stats {
  timers: number[]
  data: Record<string, string[] | undefined>
}

interface SourceMemory {
  cost: number
  miningPosition: Lookup<RoomPosition>
  energyCapacity: number
  miningCreep: string
  haulerCreeps: string[]
  carryNeeded: number
}

interface Memory {
  ticksToProfile?: number
  myRooms?: {
    [key: string]: 0
  }
  whitelist?: {
    [key: string]: number
  }
  trade_blacklist?: {
    [key: string]: number
  }
  sources?: {
    [key: string]: SourceMemory
  }
  _stats?: Stats
  runtimeTicks?: number
  runtimeAvg?: number
  debugStructures?: 0 | 1
  roomLimit?: number
  maxUpgradersCount?: number

  version?: number
}

interface BoostData {
  labs: [ResourceConstant, number][]
  creeps: [string, ResourceConstant, number, 0 | 1][]
}

interface DepositTraits {
  x: number
  y: number
  coverage: number
  lastCooldown: number
  type: DepositConstant
}

interface RoomNeighbourPath {
  name: string
  cost: number
  x: number
  y: number
  newX: number
  newY: number
  through: string
  owner?: string
  controller?: boolean
  sources?: number
  controllerFortified?: boolean
  safe?: boolean
  entranceDamage?: number
  deposits: DepositTraits[]
}

interface RoomMemory {
  structs?: string
  roads?: string
  /**
   * Shields planned in the room
   */
  s?: string
  walls?: string
  /**
   * Compressed sources information
   */
  S?: string[]
  /**
   * Colony source index from room.find sources
   */
  c?: number
  links?: string
  controllerLink?: string
  maxWorkController?: number
  workControllerOver?: number

  internalLabs?: string
  externalLabs?: string
  labState?: number
  labRecipe?: ResourceConstant
  labIndegrient1?: ResourceConstant
  labIndegrient2?: ResourceConstant
  labTargetAmount?: number

  creeps?: {
    [key: string]: 0
  }
  _claimer?: string
  _claimed?: string[]
  _dismantle?: string

  _attack?: string
  _rangedAttack?: string
  _attackLevel?: number

  _haul?: string
  _haulSize?: number
  _dig?: string
  _digger?: string
  _moveNeeds?: number
  mineDeposit?: string

  boosts?: BoostData
  r?: Lookup<RoomPosition>[] // remotes
  /**
   * Reserver creep name
   */
  R?: string
  /**
   * During that many ticks defence units
   * will hold fire when they have positive
   * breach calculated
   */
  d?: number
  /**
   * Currently apllied timeout for defence
   */
  D?: number
  /**
   * Tower ekhaustion target
   */
  e?: string
  /**
   * Creeps formed in duet
   */
  u?: [string, string]
  p?: RoomNeighbourPath[]
  /**
   * Outpost defense information - room, enemy rangedAttack and heal bodyparts
   */
  f?: [string, number, number, number]
}

interface StableRoomMemory extends RoomMemory {
  maxWorkController: number
  colonySources: SourceMap
  creeps: {
    [key: string]: 0
  }
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any
    Game: Game
    Memory: Memory
    Cache: WrappedGlobalCache
    Structure: StructureConstructor
    InterShardMemory: InterShardMemory
  }
}
