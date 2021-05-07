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

  validateSource(s: AnyStoreStructure) {
    return s.store[RESOURCE_ENERGY] >= this.minimalStoreToDraw
  }

  get sources() {
    return this.sourceMatcher
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
