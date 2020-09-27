export default class MemoryHandler {
  private memory: Memory

  constructor(memory: Memory) {
    this.memory = memory
  }

  get roomLimit() {
    return this.memory.roomLimit || Infinity
  }
}
