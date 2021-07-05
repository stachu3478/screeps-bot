// cache.d.ts
interface RoomCache {
  repaired?: 0 | 1
  averageUsage?: number
  roadBuilt?: number
  healthy?: 0 | 1
  leastAvailablePosition?: string
  scoutsWorking: number
  sourceKeeperPositions: RoomPosition[]
  structurePositions: RoomPosition[]
  labCooldown?: number
  containersPresent?: boolean
  enemy?: AnyCreep
  holdFire?: boolean
}

interface SpawnCache {
  trySpawn?: {
    creep: BodyPartConstant[]
    cooldown: number
    name: string
    memory: CreepMemory
    boost: BoostInfo[]
  }
  sourceId?: number
  distanceToController?: number
}

interface CreepCache {
  moverPath?: PathStep[]
  lastRangedHealPerformed?: number
}

interface PowerSpawnCache {
  idle?: 0 | 1
}

interface TerminalCache {
  state?: number
  dealResourceType?: ResourceConstant
}

interface FactoryCache {
  state?: number
  needs?: ResourceConstant
  dumps?: ResourceConstant
  producing?: CommodityConstant
}

interface GlobalCache {
  spawns: {
    [key: string]: SpawnCache
  }

  ownedRooms?: number
  feromon: {
    [key: string]: number
  }
}

interface WrappedGlobalCache extends GlobalCache {
  ownedRooms: number
}
