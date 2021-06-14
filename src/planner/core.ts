import _ from 'lodash'
import dump from './dump'
import planLink from './links'
import { CREEP_RANGE } from 'constants/support'
import PathMatrix from './PathMatrix'
import SourceMiningPlanner from './SourceMiningPlanner'
import planPotencialPaths from './planPotencialPaths'
import StructureMatrix from './StructureMatrix'
import StructureDistanceOptimizer from './StructureDistanceOptimizer'
import { posToChar } from './pos'

const NATIVE_LINK_COLOR = 1
const CONTROLLER_LINK_COLOR = 2
export default function plan(room: Room) {
  if (!room.controller) {
    return
  }
  const terrain = room.getTerrain()
  const pathMatrix = new PathMatrix()
  const linksMatrix = new StructureMatrix(room, pathMatrix)
  const controllerPos = room.controller.pos

  // find all paths and mark in matrix
  const sources = room.find(FIND_SOURCES)
  const sourceMiningPlanner = new SourceMiningPlanner(sources, terrain)
  sourceMiningPlanner.eachPair((pos1, pos2) => {
    pathMatrix.add(pos1, pos2, 0)
  })

  // find nearest and longest path to controller from sources
  let minCost = Infinity
  let maxCost = -Infinity
  let furthestSourceMiningPos = sources[0].pos // used as the base source
  let nearestSourceMiningPos = sources[0].pos
  sourceMiningPlanner.each((position) => {
    const { cost } = pathMatrix.add(position, controllerPos, CREEP_RANGE)
    if (cost > maxCost) {
      furthestSourceMiningPos = position
      maxCost = cost
    } else if (cost < minCost) {
      nearestSourceMiningPos = position
      minCost = cost
    }
  })

  // find path to prospect time to travel to routine place
  // plan links where it is not the base
  const sourcePathCostsToBase: number[] = []
  sourceMiningPlanner.each((position) => {
    if (position.isEqualTo(furthestSourceMiningPos)) {
      sourcePathCostsToBase.push(1)
      return
    }
    const { cost } = pathMatrix.find(position, furthestSourceMiningPos)
    planLink(position, linksMatrix, NATIVE_LINK_COLOR)
    sourcePathCostsToBase.push(cost)
  })

  // plan controller link
  const { path } = pathMatrix.find(furthestSourceMiningPos, controllerPos)
  const lastPos = _.last(path)
  planLink(lastPos, linksMatrix, CONTROLLER_LINK_COLOR)

  planPotencialPaths(room, furthestSourceMiningPos, pathMatrix)

  // plan structures
  const structureDistanceOptimizer = new StructureDistanceOptimizer(
    pathMatrix,
    room,
    linksMatrix,
  )
  const structurePositions = structureDistanceOptimizer.run(
    furthestSourceMiningPos,
  )

  const sourcePositions = sourcePathCostsToBase.map((cost, i) => {
    return (
      posToChar(sourceMiningPlanner.getMiningPosition(i)) +
      String.fromCharCode(cost)
    )
  })
  console.log('base pos is', furthestSourceMiningPos)
  dump(
    room,
    sourcePositions,
    sourceMiningPlanner.findIndexByMiningPosition(furthestSourceMiningPos),
    sourceMiningPlanner.findIndexByMiningPosition(nearestSourceMiningPos),
    structurePositions,
    linksMatrix.findPositionsByColor(NATIVE_LINK_COLOR),
    pathMatrix.positions,
    linksMatrix.findPositionsByColor(CONTROLLER_LINK_COLOR)[0],
  )
}
