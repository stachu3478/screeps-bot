export default class SourceMiningPlanner {
  private miningPositions: RoomPosition[]
  private exits: RoomPosition[]
  private sourcePositions: RoomPosition[]
  private terrain: RoomTerrain

  constructor(sources: Source[], terrain: RoomTerrain, exits: RoomPosition[]) {
    this.terrain = terrain
    this.exits = exits
    this.miningPositions = sources.map((source) => {
      return this.getBestOffset(source.pos)
    })
    this.sourcePositions = sources.map((s) => s.pos)
  }

  getMiningPosition(index: number) {
    return this.miningPositions[index]
  }

  findIndexByMiningPosition(position: RoomPosition) {
    const index = this.miningPositions.findIndex((pos) =>
      pos.isEqualTo(position),
    )
    if (index === -1) {
      throw new Error('Index from mining position not found! ' + position)
    }
    return index
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
        if (
          this.terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL ||
          this.exits.some((e) => e.isNearTo(pos))
        ) {
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
