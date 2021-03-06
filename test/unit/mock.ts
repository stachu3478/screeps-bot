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

class _AnyCreep {
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
}

export class Creep extends _AnyCreep {
  getActiveBodyparts() {
    throw new Error('Not implemented')
  }
}
export class PowerCreep extends _AnyCreep {}

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
export class CostMatrix {
  private data: number[][] = []

  set(x: number, y: number, v: number) {
    console.log('set', x, y, v)
    const yData = this.data[x] || (this.data[x] = [])
    yData[y] = v
  }

  get(x: number, y: number) {
    const yData = this.data[x] || []
    console.log('get', x, y, yData[y] || 0)
    return yData[y] || 0
  }
}
