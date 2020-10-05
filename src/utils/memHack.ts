import CacheHandler from 'handler/CacheHandler'
import IntershardMemoryHandler from 'handler/IntershardMemoryHandler'

const cache = {
  creeps: {},
  spawns: {},
  powerSpawns: {},
  rooms: {},
  terminals: {},
  factories: {},
  roomKeepers: {},
  roomStructures: {},
}

global.Cache = new CacheHandler(
  cache,
  new IntershardMemoryHandler(InterShardMemory),
)

export function getMemory(): Memory {
  try {
    return JSON.parse(RawMemory.get())
  } catch (e) {
    return {
      myRooms: {},
      profiler: {},
      creeps: {},
      powerCreeps: {},
      flags: {},
      rooms: {},
      spawns: {},
    }
  }
}

const memory = getMemory()
export const memHackBeforeLoop = () => {
  delete global.Memory
  global.Memory = memory
}

export const memHackAfterLoop = () => {
  RawMemory.set(JSON.stringify(Memory))
}
