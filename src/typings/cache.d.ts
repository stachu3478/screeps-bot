// cache.d.ts
interface RoomCache {
  repaired?: 0 | 1
  struct_iteration?: number
  road_iteration?: number
  averageUsage?: number
  built?: 0 | 1
  roadBuilt?: number
  lvl?: number
  healthy?: 0 | 1
  shielded?: number
  quadSquad?: QuadSquadHandler
  shieldPlanner?: ShieldPlanner
  defencePolicy?: DefencePolicy
  buildingRouter?: RoomBuildingRouter
  repairRouter?: RoomRepairRouter
  leastAvailablePosition?: string
  pathScanner?: RoomPathScanner
  enemyDetector?: EnemyRoomDetector
  boosts?: BoostManager
  scoutsWorking: number
  buildings?: RoomBuildings
  duet?: DuetHandler
  links?: RoomLinks

  labCooldown?: number
}

interface SpawnCache {
  trySpawn?: {
    creep: BodyPartConstant[]
    cooldown: number
    name: string
    memory: CreepMemory
    boost: BoostInfo[]
  }
  sourceId?: Id<Source>
  distanceToController?: number
}

interface CreepCache {
  moverPath?: PathStep[]
  workpartCount?: number
  routeProcessor?: ResourceRouteProcessor
  buildingRouteProcessor?: BuildingRouteProcessor
  repairRouteProcessor?: RepairRouteProcessor
  _bodypartHitThreshold?: Record<BodyPartConstant, number>
  corpus?: CreepCorpus
}

interface PowerSpawnCache {
  idle?: 0 | 1
}

interface TerminalCache {
  state?: number
  businessHandler?: BusinessHandler
  dealResourceType?: ResourceConstant
}

interface FactoryCache {
  state?: number
  needs?: ResourceConstant
  dumps?: ResourceConstant
  producing?: ResourceConstant
}

interface LinkCache {
  isDrain: boolean
  isCollector: boolean
}

interface GlobalCache {
  rooms: {
    [key: string]: RoomCache
  }
  spawns: {
    [key: string]: SpawnCache
  }
  creeps: {
    [key: string]: CreepCache
  }
  powerSpawns: {
    [key: string]: PowerSpawnCache
  }
  terminals: {
    [key: string]: TerminalCache
  }
  factories: {
    [key: string]: FactoryCache
  }
  links: {
    [key: string]: LinkCache
  }

  roomKeepers: {
    [key: string]: string
  }
  roomStructures: {
    [key: string]: string
  }
  ownedRooms?: number
  feromon: {
    [key: string]: number
  }
  capturePlanner?: EnemiesPlanner
  claimPlanner?: ClaimPlanner
}

interface WrappedGlobalCache extends GlobalCache {
  ownedRooms: number
}
