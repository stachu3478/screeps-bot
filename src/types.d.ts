// example declaration file - remove these and add your own custom typings
interface Game {
  cpu: {
    generatePixel: () => OK | ERR_NOT_ENOUGH_RESOURCES,
    getUsed: () => number
    bucket: number
    limit: number
    tickLimit: number,
    shardLimits: Object,
    getHeapStatistics: () => ({
      total_heap_size: number,
      total_heap_size_executable: number,
      total_physical_size: number,
      total_available_size: number,
      used_heap_size: number,
      heap_size_limit: number,
      malloced_memory: number,
      peak_malloced_memory: number,
      does_zap_garbage: number,
      externally_allocated_size: number,
    }),
    setShardLimits: () => ScreepsReturnCode,
  }
}

interface SourceMap {
  [id: string]: string
}
// memory extension samples
interface CreepMemory {
  role: number
  _targetRole?: number
  room: string
  state?: number
  _move?: {
    path: string,
    dest: {
      room: string,
      x: number,
      y: number,
    },
    stuck?: number
  };
  deprivity: number
  lastPos?: number
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
  totalRoadCost?: number
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
  spawnName?: string
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

  _extractor?: Id<StructureExtractor>
  _built?: boolean
  _roadBuilt?: number
  _lvl?: number
  _healthy?: boolean
  _shielded?: number
}

interface StableRoomMemory extends RoomMemory {
  maxWorkController: number
  colonySources: SourceMap
  creeps: {
    [key: string]: 0
  }
}

interface ControlledRoom extends Room {
  controller: StructureController
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any
    Game: Game
    Memory: Memory
  }
}
