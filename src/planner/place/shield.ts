import { getXYSpawn, getXYTower, getXYRampart } from 'utils/selectFromPos'
import charPosIterator from 'utils/charPosIterator'

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
    const structs = mem.structs

    this.cacheTime = Infinity
    const result = charPosIterator(structs, (x, y, _xy, i): boolean | void => {
      let structure: Structure | undefined
      if (i === 1) structure = getXYSpawn(this.room, x, y)
      else if (i > 4 && i < 11) structure = getXYTower(this.room, x, y)
      else return
      if (!structure) return
      const rampart = getXYRampart(this.room, x, y)
      if (rampart) {
        this.cacheTime = Math.min(
          this.cacheTime,
          RAMPART_DECAY_TIME * Math.floor(rampart.hits / RAMPART_DECAY_AMOUNT) +
            rampart.ticksToDecay,
        )
        return
      }
      this.cacheTime = 0
      const result = this.room.createConstructionSite(x, y, STRUCTURE_RAMPART)
      if (result === 0) return true
    })
    cache.shielded = Game.time + this.cachingTime
    return !!result
  }

  get cachingTime() {
    if (this.cacheTime === Infinity) return 100
    return this.cacheTime
  }
}
