import _ from 'lodash'
import IntershardMemoryHandler from './IntershardMemoryHandler';

export default class CacheHandler {
  private cache: GlobalCache
  private intershardMemoryHandler: IntershardMemoryHandler

  constructor(cache: GlobalCache, intershardMemoryHandler: IntershardMemoryHandler) {
    this.cache = cache
    this.intershardMemoryHandler = intershardMemoryHandler
  }

  get ownedRooms() {
    return this.cache.ownedRooms = this.intershardMemoryHandler.ownedRooms = this.cache.ownedRooms || _.size(Memory.myRooms)
  }
}
