import RoomPosition from './mock/RoomPosition'

export const Memory = {
  uuid: 0,
  log: [],
  myRooms: {},
  spawns: {},
  creeps: {},
  profiler: {},
  powerCreeps: {},
  flags: {},
  rooms: {},
} as Memory

export const RawMemory = {
  get: () => JSON.stringify(Memory),
  set: () => {},
}

export class RoomVisual {
  public roomName: string

  constructor(roomName: string) {
    this.roomName = roomName
  }
  text() {
    return this
  }
  line() {
    return this
  }
  poly() {
    return this
  }
  rect() {
    return this
  }
  circle() {
    return this
  }
  clear() {
    return this
  }
  getSize() {
    return 0
  }
}

export class RoomTerrain {
  get() {
    return 0
  }
}

export class Creep {
  public name: string
  public store: Object
  public memory: Object
  public pos: Object
  public room: Room
  public my: boolean

  constructor(name: string) {
    this.name = name
    this.store = {
      getFreeCapacity: () => 50,
    }
    this.memory = {}
    this.pos = new RoomPosition(12, 34, 'test')
    this.room = new Room('test')
    this.my = true
  }

  getActiveBodyparts() {
    throw new Error('Not implemented')
  }
}

export const SourcyCreep = {
  store: { getFreeCapacity: () => 50 },
  memory: {} as CreepMemory,
  pos: {
    findClosestByPath: (structure: FindConstant) => {
      if (structure === FIND_SOURCES_ACTIVE)
        return {
          id: '1234',
        } as Source
      return null
    },
  } as RoomPosition,
}

export const Structure = class {}
export const OwnedStructure = class extends Structure {}
export const Spawn = {}
export const Source = {}
export const Flag = {}
