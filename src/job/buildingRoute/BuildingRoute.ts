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
  /**
   * Custom condition function based on room
   */
  if?: (room: Room) => boolean
  /**
   * Function launched when all work is done
   */
  done?: (room: Room) => any
  /**
   * Whether building should be replaced if an other type exists there
   */
  forceReplacement?: boolean | ((room: Room) => boolean)
  /**
   * Whether building should be replaced if an other type exists there
   */
  remote?: boolean
}

const truther = () => true
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

  get if() {
    return this.options.if || truther
  }

  get done() {
    return this.options.done || truther
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

  get forceReplacement() {
    return this.options.forceReplacement
  }

  get remote() {
    return !!this.options.remote
  }

  private get minimalStoreToDraw() {
    return 1000
  }
}
