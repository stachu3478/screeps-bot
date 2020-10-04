global.Cache = {
  creeps: {},
  spawns: {},
  powerSpawns: {},
  rooms: {},
  terminals: {},
  factories: {},
  roomKeepers: {},
  roomStructures: {},
}

const memory = JSON.parse(RawMemory.get())
export const memHackBeforeLoop = () => {
  delete global.Memory
  global.Memory = memory
}

export const memHackAfterLoop = () => {
  RawMemory.set(JSON.stringify(Memory))
}
