import CacheHandler from 'handler/CacheHandler'
import IntershardMemoryHandler from 'handler/IntershardMemoryHandler'
import runMigration, { VERSION } from 'utils/migrate'

global.InterShardMemory = global.InterShardMemory || {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => '',
}

const cache = {
  creeps: {},
  spawns: {},
  powerSpawns: {},
  rooms: {},
  terminals: {},
  factories: {},
  roomKeepers: {},
  roomStructures: {},
  feromon: {},
  links: {},
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
  // @ts-ignore memhacked
  delete global.Memory
  global.Memory = memory

  let version = Memory.version || 0
  while (version < VERSION) {
    runMigration()
    version = Memory.version = VERSION
  }
}

export const memHackAfterLoop = () => {
  RawMemory.set(JSON.stringify(Memory))
}
