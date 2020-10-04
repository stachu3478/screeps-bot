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

  get creeps() {
    return this.cache.creeps
  }

  get spawns() {
    return this.cache.spawns
  }

  get powerSpawns() {
    return this.cache.powerSpawns
  }

  get rooms() {
    return this.cache.rooms
  }

  get terminals() {
    return this.cache.terminals
  }

  get factories() {
    return this.cache.factories
  }

  get roomKeepers() {
    return this.cache.roomKeepers
  }

  get roomStructures() {
    return this.cache.roomStructures
  }

  get ownedRooms() {
    return (this.cache.ownedRooms = this.intershardMemoryHandler.ownedRooms =
      this.cache.ownedRooms || _.size(Memory.myRooms))
  }
}
