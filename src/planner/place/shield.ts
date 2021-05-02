import { getXYRampart } from 'utils/selectFromPos'
import { defaultCheckCacheTime } from 'config/rampart'

export default class ShieldPlacer {
  private room: Room
  private cacheTime: number

  constructor(controller: StructureController) {
    this.room = controller.room
    this.cacheTime = 0
  }

  create() {
    const mem = this.room.memory
    const cache = this.room.cache
    if (cache.shielded || 0 > Game.time) return false
    if (!mem.structs) return false

    this.cacheTime = Infinity
    const result = this.room.shieldPositions.some((roomPos) => {
      const structure = roomPos.lookFor(LOOK_STRUCTURES)
      if (!structure) return false
      const rampart = getXYRampart(this.room, roomPos.x, roomPos.y)
      if (rampart) {
        this.cacheTime = Math.min(
          this.cacheTime,
          RAMPART_DECAY_TIME * Math.floor(rampart.hits / RAMPART_DECAY_AMOUNT) +
            rampart.ticksToDecay,
        )
        return false
      }
      this.cacheTime = 0
      const result = this.room.createConstructionSite(
        roomPos,
        STRUCTURE_RAMPART,
      )
      return result === 0
    })
    cache.shielded = Game.time + this.cachingTime
    return !!result
  }

  get cachingTime() {
    if (this.cacheTime === Infinity) return defaultCheckCacheTime
    return this.cacheTime
  }
}
