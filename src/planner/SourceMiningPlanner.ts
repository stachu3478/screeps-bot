export default class SourceMiningPlanner {
  private miningPositions: RoomPosition[]
  private sourcePositions: RoomPosition[]
  private terrain: RoomTerrain

  constructor(sources: Source[], terrain: RoomTerrain) {
    this.terrain = terrain
    this.miningPositions = sources.map((source) => {
      return this.getBestOffset(source.pos)
    })
    this.sourcePositions = sources.map((s) => s.pos)
  }

  getMiningPosition(index: number) {
    return this.miningPositions[index]
  }

  findIndexByMiningPosition(position: RoomPosition) {
    return this.miningPositions.findIndex((pos) => pos.isEqualTo(position))
  }

  eachPair(callback: (pos1: RoomPosition, pos2: RoomPosition) => void) {
    this.miningPositions.forEach((pos1) => {
      this.miningPositions.forEach((pos2) => {
        if (pos1 === pos2) return
        callback(pos1, pos2)
      })
    })
  }

  each(callback: (pos: RoomPosition, sourcePos: RoomPosition) => void) {
    this.miningPositions.forEach((pos, i) => {
      callback(pos, this.sourcePositions[i])
    })
  }

  getBestOffset(position: RoomPosition) {
    let maxFreeSpace = -Infinity
    let bestPosition = position
    position.eachOffset((offsetPos) => {
      if (this.terrain.get(offsetPos.x, offsetPos.y) === TERRAIN_MASK_WALL) {
        return
      }
      let freeSpace = 0
      offsetPos.eachOffset((pos) => {
        if (this.terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
          return
        }
        freeSpace++
      })
      if (freeSpace > maxFreeSpace) {
        maxFreeSpace = freeSpace
        bestPosition = offsetPos
      }
    })
    return bestPosition
  }
}
