import _ from 'lodash'
import IntershardMemoryHandler from './IntershardMemoryHandler'

export default class CacheHandler {
  private cache: GlobalCache
  private intershardMemoryHandler: IntershardMemoryHandler

  constructor(
    cache: GlobalCache,
    intershardMemoryHandler: IntershardMemoryHandler,
  ) {
    this.cache = cache
    this.intershardMemoryHandler = intershardMemoryHandler
  }

  get spawns() {
    return this.cache.spawns
  }

  get ownedRooms() {
    return (this.cache.ownedRooms = this.intershardMemoryHandler.ownedRooms =
      this.cache.ownedRooms || _.size(Memory.myRooms || {}))
  }

  set ownedRooms(val: number) {
    this.cache.ownedRooms = this.intershardMemoryHandler.ownedRooms = val
  }

  get feromon() {
    return this.cache.feromon
  }

  get links() {
    return this.cache.links
  }
}
