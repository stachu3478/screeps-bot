interface SourceMap {
  [id: string]: string
}

type RouteStatus = [number, number, number]
// memory extension samples
interface CreepMemory {
  role: Role
  _targetRole?: number
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
}

interface Stats {
  timers: number[]
  data: Record<string, string[] | undefined>
}

interface Memory {
  ticksToProfile?: number
  myRooms: {
    [key: string]: 0
  }
  whitelist?: {
    [key: string]: number
  }
  trade_blacklist?: {
    [key: string]: number
  }
  _stats?: Stats
  runtimeTicks?: number
  runtimeAvg?: number
  debugStructures?: 0 | 1
  roomLimit?: number
  autoScout?: boolean
  slimClaimers?: boolean
  maxUpgradersCount?: number
  pathRoomBlacklist?: {
    [key: string]: 1
  }

  profiler: any
}

interface BoostData {
  labs: [ResourceConstant, number][]
  creeps: [string, ResourceConstant, number, 0 | 1][]
}

interface RoomNeighbourPath {
  name: string
  cost: number
  x: number
  y: number
  through: string
  owner?: string
  controller?: boolean
  sources?: number
  controllerFortified?: boolean
  safe?: boolean
  entranceDamage?: number
}

interface RoomMemory {
  structs?: string
  roads?: string
  /**
   * Shields planned in the room
   */
  s?: string
  walls?: string
  colonySources?: SourceMap
  colonySourceId?: Id<Source>
  links?: string
  controllerLink?: string
  sourceCount?: number
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

  boosts?: BoostData
  r?: RemoteMemory[] // remotes
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
  p?: RoomNeighbourPath[]
}

interface RemoteMemory {
  c: RemoteCreepMemory[] // creeps
  h: RemoteCreepMemory // harvester memory
  s: {
    // source
    x: number
    y: number
    n: string // roomName
  }
}

interface RemoteCreepMemory {
  n: string // name
  s: State // state
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
