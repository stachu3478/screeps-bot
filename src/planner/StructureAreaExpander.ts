import PathMatrix from './PathMatrix'
import StructureDistanceMatrix from './StructureDistanceMatrix'
import StructureMatrix from './StructureMatrix'

export default class StructureAreaExpander {
  private distanceMatrix: StructureDistanceMatrix
  private pathMatrix: PathMatrix
  private structureMatrix: StructureMatrix
  private blackStructureMatrix: StructureMatrix
  private terrain: RoomTerrain
  private roadsVisited: RoomPosition[] = []

  constructor(
    pathMatrix: PathMatrix,
    blackStructureMatrix: StructureMatrix,
    room: Room,
  ) {
    this.structureMatrix = new StructureMatrix(room, pathMatrix)
    this.distanceMatrix = new StructureDistanceMatrix(this.structureMatrix)
    this.pathMatrix = pathMatrix
    this.blackStructureMatrix = blackStructureMatrix
    this.terrain = room.getTerrain()
  }

  findBestExpansionPosition(positions: RoomPosition[]) {
    const expansionPositions = this.findExpansionPositions(positions)
    console.log('expansion positions:', expansionPositions)
    return (
      this.findExpansionPositionWithImprovement(expansionPositions) || // standard expansion
      this.findOnRoadExpansionPosition(expansionPositions) || // road fallback
      this.findExpansionPositionWithImprovement(expansionPositions, 0) || // fat fallback
      expansionPositions[0]
    ) // any !!!
  }

  private findExpansionPositionWithImprovement(
    positions: RoomPosition[],
    value = 1,
  ) {
    let minDistance = Infinity
    let position: RoomPosition | undefined
    let bestImprovement = 0
    positions.forEach((pos) => {
      const improvement = this.getImprovementValue(pos)
      if (improvement < value) {
        return
      }
      const distance = this.distanceMatrix.createDistance(pos)
      if (distance > minDistance) {
        return
      }
      if (improvement < bestImprovement) {
        return
      }
      minDistance = distance
      bestImprovement = improvement
      position = pos
    })
    console.log('best improvement for', position, bestImprovement, minDistance)
    return position
  }

  private findOnRoadExpansionPosition(positions: RoomPosition[]) {
    const found = positions.find((pos) => {
      return (
        this.pathMatrix.isRoad(pos) &&
        !this.roadsVisited.some((p) => p.isEqualTo(pos))
      )
    })
    if (found) {
      this.roadsVisited.push(found)
    }
    return found
  }

  private getImprovementValue(pos: RoomPosition) {
    let improvement = 0
    pos.eachOffset((offsetPos) => {
      if (
        this.isExpansionPosition(offsetPos) &&
        this.structureMatrix.canBeAdded(offsetPos)
      ) {
        improvement++
      }
    })
    if (!this.structureMatrix.isStructure(pos)) {
      improvement--
    }
    return improvement
  }

  private findExpansionPositions(positions: RoomPosition[]) {
    const expansionPositions: RoomPosition[] = []
    positions.forEach((pos) =>
      this.findExpansionPositionsFor(pos, expansionPositions),
    )
    return expansionPositions
  }

  private findExpansionPositionsFor(
    pos: RoomPosition,
    positions: RoomPosition[] = [],
  ) {
    pos.eachOffset((offsetPos) => {
      if (this.isExpansionPosition(offsetPos)) {
        positions.push(offsetPos)
      }
    })
    return positions
  }

  private isExpansionPosition(pos: RoomPosition) {
    return (
      !this.blackStructureMatrix.isStructure(pos) &&
      this.terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL
    )
  }

  get distMatrix() {
    return this.distanceMatrix
  }
}
