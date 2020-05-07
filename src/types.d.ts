// example declaration file - remove these and add your own custom typings
interface SourceMap {
  [id: string]: string
}
// memory extension samples
interface CreepMemory {
  role: number
  room: string
  state?: number
  prevState?: number
  _move?: {
    path: string,
    target: {
      x: number,
      y: number,
    },
    stuck?: number
  };
  _harvest?: Id<Source>
  _extract?: MineralConstant
  _fill?: Id<StructureSpawn | StructureExtension | StructureTower>
  _repair?: Id<Structure>
  _auto_repair?: Id<Structure>
  _repair_cooldown?: number
  _build?: Id<ConstructionSite>
  _arrive?: string
  _exit?: string
  _dismantle?: Id<Structure>
  _heal?: Id<Creep>
  _attack?: Id<Creep | Structure>
  _pick_pos?: string
  _prev_hits?: number
  _draw?: Id<StructureContainer>
  deprivity: number
}

interface SpawnMemory {
  upgradeMode?: boolean
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
  roomCacheKeepers?: {
    [key: string]: string
  }
}

interface RoomMemory {
  structs?: string
  totalRoadCost?: number
  roads?: string
  colonySources?: SourceMap
  colonySourceId?: Id<Source>
  sourceCount?: number
  maxWorkController?: number
  workControllerOver?: number
  spawnName?: string
  _struct_iteration?: number
  _road_iteration?: number
  creeps?: {
    [key: string]: 0
  }
  _claim: string
  _claimer: string
  _dismantle?: string
  averageUsage?: number
  _attack?: string
  _extractor?: Id<StructureExtractor>
  _mineral?: Id<Mineral>
  _built?: boolean
  _roadBuilt?: boolean
  _lvl?: number
  _healthy?: boolean
}

interface ControlledRoom extends Room {
  controller: StructureController
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
