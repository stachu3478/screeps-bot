export default class MemoryHandler {
  static get sources() {
    if (!Memory.sources) {
      Memory.sources = {}
    }
    return Memory.sources
  }
}
