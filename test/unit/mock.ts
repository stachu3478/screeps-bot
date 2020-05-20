export const Memory = {
  uuid: 0,
  log: [],
  myRooms: {},
  spawns: {},
  creeps: {}
} as Memory;

export const RawMemory = {
  get: () => JSON.stringify(Memory),
  set: () => { }
}

export class RoomVisual {
  public roomName: string

  constructor(roomName: string) {
    this.roomName = roomName
  }
  text() { return this }
  line() { return this }
  poly() { return this }
  rect() { return this }
  circle() { return this }
  clear() { return this }
  getSize() { return 0 }
}

export class RoomTerrain {
  get() { return 0 }
}

export const Creep = {
  store: { getFreeCapacity: () => 50 },
  memory: {} as CreepMemory,
  pos: {
    findClosestByPath: (CNST: FindConstant) => null
  } as RoomPosition
}

export const SourcyCreep = {
  store: { getFreeCapacity: () => 50 },
  memory: {} as CreepMemory,
  pos: {
    findClosestByPath: (structure: FindConstant) => {
      if (structure === FIND_SOURCES_ACTIVE) return {
        id: "1234"
      } as Source
      return null
    }
  } as RoomPosition
}

export const Structure = {}
export const Spawn = {}
export const Source = {}
export const Flag = {}
