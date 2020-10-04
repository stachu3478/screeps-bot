interface RoomCache {
  priorityFilled?: 0 | 1
  repaired?: 0 | 1
  struct_iteration?: number
  road_iteration?: number
  averageUsage?: number
  built?: 0 | 1
  roadBuilt?: number
  lvl?: number
  healthy?: 0 | 1
  shielded?: number

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
}

interface CreepCache {
  workpartCount?: number
}

interface PowerSpawnCache {
  idle?: 0 | 1
}

interface TerminalCache {
  dealResourceType?: ResourceConstant
  resourceIteration?: number
  state?: number

  businessSell?: 0 | 1
  businessAmount?: number
}

interface FactoryCache {
  state?: number
  needs?: ResourceConstant
  dumps?: ResourceConstant
  producing?: ResourceConstant
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

  roomKeepers: {
    [key: string]: string
  }
  roomStructures: {
    [key: string]: string
  }
  ownedRooms?: number
}

interface WrappedGlobalCache extends GlobalCache {
  ownedRooms: number
}
