export const Memory = {
  creeps: []
};

export const RawMemory = {
  get: () => JSON.stringify(Memory),
  set: () => { }
}

export class RoomVisual {
  text() { }
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
