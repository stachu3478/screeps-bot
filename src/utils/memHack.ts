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

const memory = JSON.parse(RawMemory.get())
export const memHackBeforeLoop = () => {
  delete global.Memory
  global.Memory = memory
}

export const memHackAfterLoop = () => {
  RawMemory.set(JSON.stringify(Memory))
}
