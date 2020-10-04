interface ShardMemory {
  [ShardMemoryKeys.ownedRooms]: number
  [ShardMemoryKeys.roomLimit]: number
  [ShardMemoryKeys.creeps]: {
    [key: string]: CreepMemory
  }
}

export default class IntershardMemoryHandler {
  private memory: InterShardMemory
  private parsedMemory: ShardMemory
  private memoryChanged: boolean

  constructor(memory: InterShardMemory) {
    this.memory = memory
    this.memoryChanged = true
    this.parsedMemory = {
      [ShardMemoryKeys.roomLimit]: Infinity,
      [ShardMemoryKeys.ownedRooms]: 0,
      [ShardMemoryKeys.creeps]: {},
    }
  }

  set roomLimit(v: number) {
    this.parsedMemory[ShardMemoryKeys.roomLimit] = v
    this.memoryChanged = true
  }

  set ownedRooms(v: number) {
    this.parsedMemory[ShardMemoryKeys.ownedRooms] = v
    this.memoryChanged = true
  }

  endTick() {
    if (this.memoryChanged) {
      this.memoryChanged = false
      this.memory.setLocal(JSON.stringify(this.parsedMemory))
    }
  }
}
