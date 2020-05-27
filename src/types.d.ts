// example declaration file - remove these and add your own custom typings
interface SourceMap {
  [id: string]: string
}
// memory extension samples
interface CreepMemory {
  role: number
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
}

interface SpawnMemory {
  trySpawn?: {
    creep: BodyPartConstant[]
    cooldown: number
    name: string
    memory: CreepMemory
  }
  spawnSourceId?: Id<Source>
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
  runtimeTicks?: number
  runtimeAvg?: number
}

interface BoostData {
  creeps: string[]
  resources: ResourceConstant[]
  amounts: number[]
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

  boost?: BoostData

  _extractor?: Id<StructureExtractor>
  _mineral?: Id<Mineral>
  _built?: boolean
  _roadBuilt?: number
  _lvl?: number
  _healthy?: boolean
  _linked?: 0 | 1
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
    log: any;
    Memory: Memory
  }
}
