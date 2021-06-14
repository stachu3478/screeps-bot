import _ from 'lodash'
import PathGarbageCollector from './PathGarbageCollector'
import PathMatrix from './PathMatrix'
import StructureAreaExpander from './StructureAreaExpander'
import StructureDistanceMatrix from './StructureDistanceMatrix'
import StructureMatrix from './StructureMatrix'

export default class StructureDistanceOptimizer {
  private pathMatrix: PathMatrix
  private distanceMatrix: StructureDistanceMatrix
  private areaExpander: StructureAreaExpander
  private blackStructuresMatrix: StructureMatrix
  private pathGarbageCollector: PathGarbageCollector

  constructor(
    pathMatrix: PathMatrix,
    room: Room,
    blackStructuresMatrix: StructureMatrix,
  ) {
    this.pathMatrix = pathMatrix
    this.areaExpander = new StructureAreaExpander(
      pathMatrix,
      blackStructuresMatrix,
      room,
    )
    this.distanceMatrix = this.areaExpander.distMatrix
    this.blackStructuresMatrix = blackStructuresMatrix
    this.pathGarbageCollector = new PathGarbageCollector(
      this.distanceMatrix,
      pathMatrix,
    )
  }

  // try to improve distance from desired source to structures AMAP
  run(from: RoomPosition) {
    const improvementPositions = [from]
    this.distanceMatrix.init(from)
    this.distanceMatrix.addStructuresAround(from, this.blackStructuresMatrix)
    let toBeAdded = this.minStructures
    let ops = 100
    while (
      toBeAdded >= this.distanceMatrix.positions.length &&
      improvementPositions.length &&
      ops > 0
    ) {
      const expansionPosition = this.areaExpander.findBestExpansionPosition(
        improvementPositions,
      )
      improvementPositions.push(expansionPosition)
      if (this.distanceMatrix.isStructure(expansionPosition)) {
        this.distanceMatrix.remove(expansionPosition)
      }
      this.pathMatrix.set(expansionPosition)
      this.distanceMatrix.addStructuresAround(
        expansionPosition,
        this.blackStructuresMatrix,
      )
      this.pathGarbageCollector.collectFromOffsets(expansionPosition)
      ops--
    }
    this.pathGarbageCollector.collectAll()
    return this.distanceMatrix.positions
  }

  private get minStructures() {
    return _.sum(CONTROLLER_STRUCTURES, (s) => {
      const max = _.max(s)
      if (max === 2500 || typeof max !== 'number') {
        return 0
      }
      return max
    })
  }
}
