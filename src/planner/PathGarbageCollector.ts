import _ from 'lodash'
import PathMatrix from './PathMatrix'
import StructureDistanceMatrix from './StructureDistanceMatrix'

export default class PathGarbageCollector {
  private structureDistanceMatrix: StructureDistanceMatrix
  private pathMatrix: PathMatrix

  constructor(
    structureDistanceMatrix: StructureDistanceMatrix,
    pathMatrix: PathMatrix,
  ) {
    this.structureDistanceMatrix = structureDistanceMatrix
    this.pathMatrix = pathMatrix
  }

  collectAll() {
    this.pathMatrix.positions.forEach((pos) => {
      this.collect(pos)
    })
  }

  collectFromOffsets(position: RoomPosition) {
    return _.sum(position.allOffsets, (offsetPos) => {
      return this.collect(offsetPos, true)
    })
  }

  collect(position: RoomPosition, replace = false) {
    if (this.isGarbage(position)) {
      this.remove(position, replace)
      return 1
    }
    return 0
  }

  private isGarbage(position: RoomPosition) {
    const offsetPositions = position.allOffsets
    return (
      this.roadsConnect(offsetPositions) &&
      this.structuresAroundAreAccessible(position, offsetPositions)
    )
  }

  private roadsConnect(offsetPositions: RoomPosition[]) {
    const connected: RoomPosition[] = []
    let toBeConnected: RoomPosition[] = []
    offsetPositions.forEach((offsetPos) => {
      if (!this.pathMatrix.isRoad(offsetPos)) {
        return
      }
      if (
        !connected.length ||
        connected.some((pos) => offsetPos.isNearTo(pos))
      ) {
        connected.push(offsetPos)
      } else {
        toBeConnected.push(offsetPos)
      }
    })
    let progress = true
    while (progress && toBeConnected.length) {
      progress = false
      toBeConnected = toBeConnected.filter((offsetPos) => {
        if (connected.some((pos) => offsetPos.isNearTo(pos))) {
          connected.push(offsetPos)
          progress = true
          return false
        }
        return true
      })
    }
    return toBeConnected.length === 0 && connected.length > 1
  }

  private structuresAroundAreAccessible(
    position: RoomPosition,
    offsetPositions: RoomPosition[],
  ) {
    return offsetPositions.every((offsetPos) => {
      if (this.structureDistanceMatrix.isStructure(offsetPos)) {
        return offsetPos.allOffsets.some((pos) => {
          return !pos.isEqualTo(position) && this.pathMatrix.isRoad(pos)
        })
      }
      return true
    })
  }

  private remove(position: RoomPosition, replace = true) {
    this.pathMatrix.remove(position)
    if (replace) {
      this.structureDistanceMatrix.add(position)
    }
  }
}
