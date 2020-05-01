export const Game = {
  creeps: [],
  rooms: [],
  spawns: {},
  time: 12345,
  getObjectById: () => null
};

export const Memory = {
  creeps: []
};

export const Creep = {
  memory: {} as CreepMemory,
  pos: {
    findClosestByPath: (CNST: FindConstant) => null
  } as RoomPosition
}

export const SourcyCreep = {
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
