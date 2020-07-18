interface SourceMap {
  [id: string]: string
}
// memory extension samples
interface CreepMemory {
  role: Role
  _targetRole?: number
  room: string
  state?: State
  _move?: {
    path: string,
    dest: {
      room: string,
      x: number,
      y: number,
    },
    t?: number
  };
  deprivity: number
  [Keys.workpartCount]?: number
}

interface SpawnMemory {
  trySpawn?: {
    creep: BodyPartConstant[]
    cooldown: number
    name: string
    memory: CreepMemory
    boost: BoostInfo[]
  }
  spawnSourceId?: Id<Source>
}

interface Stats {
  timers: number[]
  data: Record<string, string[] | undefined>
}

interface Memory {
  uuid: number
  log: any
  ticksToProfile?: number
  myRooms: {
    [key: string]: 0
  }
  whitelist?: {
    [key: string]: number
  }
  blacklist?: {
    [key: string]: number
  }
  roomCacheKeepers?: {
    [key: string]: string
  }
  trade_blacklist?: {
    [key: string]: number
  }
  _stats?: Stats
  runtimeTicks?: number
  runtimeAvg?: number
  debugStructures?: 0 | 1
  pathRoomBlacklist?: {
    [key: string]: 1
  }
}

interface BoostData {
  creeps: string[]
  resources: {
    labs: (ResourceConstant | undefined)[]
    creeps: ResourceConstant[]
  }
  amounts: {
    labs: (number | undefined)[]
    creeps: number[]
  }
}

interface RoomMemory {
  structs?: string
  roads?: string
  shields?: string
  walls?: string
  colonySources?: SourceMap
  colonySourceId?: Id<Source>
  links?: string
  controllerLink?: string
  sourceCount?: number
  maxWorkController?: number
  workControllerOver?: number
  priorityFilled?: 0 | 1
  repaired?: 0 | 1

  terminalState?: number
  terminalDealResourceType?: ResourceConstant
  terminalResourceIteration?: number
  termBusinessSell?: 0 | 1
  termBusinessAmount?: number

  internalLabs?: string
  externalLabs?: string
  labState?: number
  labCooldown?: number
  labRecipe?: ResourceConstant
  labIndegrient1?: ResourceConstant
  labIndegrient2?: ResourceConstant
  labTargetAmount?: number

  [Keys.powerSpawnIdle]?: 0 | 1

  depositRoom?: string
  depositLastCooldown?: number

  factoryNeeds?: ResourceConstant
  factoryDumps?: ResourceConstant
  factoryState?: number
  factoryProducing?: ResourceConstant

  _struct_iteration?: number
  _road_iteration?: number
  creeps?: {
    [key: string]: 0
  }
  _claim?: string
  _claimer?: string
  _claimed?: string[]
  _dismantle?: string
  averageUsage?: number

  _attack?: string
  _attackLevel?: number

  _haul?: string
  _haulSize?: number

  boosts?: BoostData

  _built?: 0 | 1
  _roadBuilt?: number
  _lvl?: number
  _healthy?: 0 | 1
  _shielded?: number
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
  }
}
