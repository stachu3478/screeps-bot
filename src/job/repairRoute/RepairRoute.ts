import StructureMatcher from '../resourceRoute/matcher/structureMatcher'
import { StoreStructureSelector } from '../selector/StoreStructureSelector'

type BuildableStructureSelector = (
  r: Room,
) => Structure<BuildableStructureConstant>[]
interface RepairRouteOptions {
  /**
   * Specifies structure type to place
   */
  structure: BuildableStructureConstant | BuildableStructureSelector
  /**
   * Repair up to these hits
   */
  hits: number
  /**
   * Specifies all sources that the energy will be taken from
   */
  from: AnyStoreStructure['structureType'] | StoreStructureSelector
  /**
   * Conditional minimal amount in sources to take from
   * NOTE: More of the recourse can be taken
   */
  minimalStore?: number
}

export default class RepairRoute {
  private options: RepairRouteOptions
  private sourceMatcher: StructureMatcher

  constructor(options: RepairRouteOptions) {
    this.options = options
    this.sourceMatcher = new StructureMatcher(this.options.from)
  }

  validateSource(s: AnyStoreStructure) {
    return s.store[RESOURCE_ENERGY] >= this.minimalStoreToDraw
  }

  validateTarget(s: Structure<BuildableStructureConstant>) {
    return s.hits < this.options.hits && s.hits < s.hitsMax
  }

  get sources() {
    return this.sourceMatcher
  }

  get structure() {
    return this.options.structure
  }

  private get minimalStoreToDraw() {
    return this.options.minimalStore || 50
  }
}
