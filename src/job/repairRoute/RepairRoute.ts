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
  /**
   * Conditional minimal amount in sources to force creep
   * spawn that performs that job
   */
  minimalStoreToSpawn?: number
  /**
   * Whether the structure has to be chosen
   * by least hits, otherwise nearest
   */
  orderByHits?: boolean
}

export default class RepairRoute {
  private options: RepairRouteOptions
  private sourceMatcher: StructureMatcher

  constructor(options: RepairRouteOptions) {
    this.options = options
    this.sourceMatcher = new StructureMatcher(this.options.from)
  }

  validateSource(s: AnyStoreStructure, toSpawn = false) {
    return s.store[RESOURCE_ENERGY] >= this.getMinimalStoreToDraw(toSpawn)
  }

  validateTarget(s: Structure<BuildableStructureConstant>) {
    return s.hits < this.options.hits && s.hits < s.hitsMax
  }

  private getMinimalStoreToDraw(toSpawn = false) {
    const nominal = this.minimalStoreToDraw
    if (toSpawn) return Math.max(nominal, this.options.minimalStoreToSpawn || 0)
    return nominal
  }

  get sources() {
    return this.sourceMatcher
  }

  get structure() {
    return this.options.structure
  }

  get orderByHits() {
    return !!this.options.orderByHits
  }

  private get minimalStoreToDraw() {
    return this.options.minimalStore || 50
  }
}
