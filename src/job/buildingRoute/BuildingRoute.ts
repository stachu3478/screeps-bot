import StructureMatcher from '../resourceRoute/matcher/structureMatcher'
import { StoreStructureSelector } from '../selector/StoreStructureSelector'

interface BuildingRouteOptions {
  /**
   * Specifies structure type to place
   */
  structure: BuildableStructureConstant
  /**
   * Specifies all positions where the structure should be placed
   */
  positions: (room: Room) => RoomPosition[]
  /**
   * Specifies all sources that the energy will be taken from
   */
  from: AnyStoreStructure['structureType'] | StoreStructureSelector
}

export default class BuildingRoute {
  private options: BuildingRouteOptions
  private sourceMatcher: StructureMatcher

  constructor(options: BuildingRouteOptions) {
    this.options = options
    this.sourceMatcher = new StructureMatcher(this.options.from)
  }

  /**
   * Checks wherever the route processing should be skipped
   */
  skip(room: Room) {
    const controller = room.controller
    if (!controller) return true
    if (!controller.my) return true
    if (!CONTROLLER_STRUCTURES[this.options.structure][controller.level])
      return true
    return false
  }

  findSources(room: Room) {
    const match = this.sourceMatcher.call(room) as AnyStoreStructure[]
    return match.filter((s) => this.validateSource(s))
  }

  validateSource(s: AnyStoreStructure) {
    return s.store[RESOURCE_ENERGY] >= this.minimalStoreToDraw
  }

  get positions() {
    return this.options.positions
  }

  get structure() {
    return this.options.structure
  }

  private get minimalStoreToDraw() {
    return 1000
  }
}
