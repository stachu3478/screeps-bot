import _ from 'lodash'
import dump from './dump'
import planLink from './links'
import { CREEP_RANGE } from '../../constants/support'
import PathMatrix from '../PathMatrix'
import SourceMiningPlanner from './SourceMiningPlanner'
import planPotencialPaths from './planPotencialPaths'
import StructureMatrix from './StructureMatrix'
import StructureDistanceOptimizer from './StructureDistanceOptimizer'
import { posToChar } from '../pos'

const NATIVE_LINK_COLOR = 1
const CONTROLLER_LINK_COLOR = 2
const MINERAL_PATH_COAT_COLOR = 3
export default class RoomStructuresPlanner {
  private room: Room
  private controllerPos: RoomPosition
  private terrain: RoomTerrain
  private pathMatrix: PathMatrix
  private firstPlanMatrix: StructureMatrix
  private sourceMiningPlanner: SourceMiningPlanner
  private furthestSourceMiningPos: RoomPosition // used as the base source
  private nearestSourceMiningPos: RoomPosition
  private sourcePathCostsToBase: number[] = []

  constructor(room: Room, controllerPos: RoomPosition) {
    this.room = room
    this.controllerPos = controllerPos
    this.terrain = room.getTerrain()
    this.pathMatrix = new PathMatrix(this.terrain)
    this.firstPlanMatrix = new StructureMatrix(room, this.pathMatrix)
    const sources = room.find(FIND_SOURCES)
    this.sourceMiningPlanner = new SourceMiningPlanner(
      sources,
      this.terrain,
      room.find(FIND_EXIT),
    )
    this.furthestSourceMiningPos = controllerPos
    this.nearestSourceMiningPos = controllerPos
  }

  run() {
    this.markPathsBetweenSources()
    this.markPathsFromSourcesToController()
    this.planMineralPath()
    this.markSourcePathCostsAndLinks()
    this.planControllerLink()
    this.planRemainingPaths()
    this.dumpDataToMemory(this.planRemainingStructures())
  }

  private markPathsBetweenSources() {
    this.sourceMiningPlanner.eachPair((pos1, pos2) => {
      this.pathMatrix.add(pos1, pos2, 0)
    })
  }

  private markPathsFromSourcesToController() {
    // find nearest and longest path to controller from sources
    let minCost = Infinity
    let maxCost = -Infinity
    this.sourceMiningPlanner.each((position) => {
      const { cost } = this.pathMatrix.add(
        position,
        this.controllerPos,
        CREEP_RANGE,
      )
      if (cost > maxCost) {
        this.furthestSourceMiningPos = position
        maxCost = cost
      }
      if (cost < minCost) {
        this.nearestSourceMiningPos = position
        minCost = cost
      }
    })
  }

  private planMineralPath() {
    const mineral = this.room.mineral
    if (mineral) {
      const { path } = this.pathMatrix.add(
        this.furthestSourceMiningPos,
        mineral.pos,
        1,
      )
      this.firstPlanMatrix.add(_.last(path), MINERAL_PATH_COAT_COLOR, true)
    }
  }

  private markSourcePathCostsAndLinks() {
    // find path to prospect time to travel to routine place
    // plan links where it is not the base
    this.sourceMiningPlanner.each((position) => {
      if (position.isEqualTo(this.furthestSourceMiningPos)) {
        this.sourcePathCostsToBase.push(1)
        return
      }
      const { cost } = this.pathMatrix.find(
        position,
        this.furthestSourceMiningPos,
      )
      planLink(position, this.firstPlanMatrix, NATIVE_LINK_COLOR)
      this.sourcePathCostsToBase.push(cost)
    })
  }

  private planControllerLink() {
    const { path } = this.pathMatrix.find(
      this.furthestSourceMiningPos,
      this.controllerPos,
    )
    const lastPos = _.last(path)
    planLink(lastPos, this.firstPlanMatrix, CONTROLLER_LINK_COLOR)
  }

  private planRemainingPaths() {
    planPotencialPaths(this.room, this.furthestSourceMiningPos, this.pathMatrix)
  }

  private planRemainingStructures() {
    return new StructureDistanceOptimizer(
      this.pathMatrix,
      this.room,
      this.firstPlanMatrix,
    ).run(this.furthestSourceMiningPos)
  }

  private dumpDataToMemory(structurePositions: RoomPosition[]) {
    const sourcePositions = this.sourcePathCostsToBase.map((cost, i) => {
      return (
        posToChar(this.sourceMiningPlanner.getMiningPosition(i)) +
        String.fromCharCode(cost)
      )
    })
    console.log('base pos is', this.furthestSourceMiningPos)
    dump(
      this.room,
      sourcePositions,
      this.sourceMiningPlanner.findIndexByMiningPosition(
        this.furthestSourceMiningPos,
      ),
      this.sourceMiningPlanner.findIndexByMiningPosition(
        this.nearestSourceMiningPos,
      ),
      structurePositions,
      this.firstPlanMatrix.findPositionsByColor(NATIVE_LINK_COLOR),
      this.pathMatrix.positions,
      this.firstPlanMatrix.findPositionsByColor(CONTROLLER_LINK_COLOR)[0],
    )
  }
}
