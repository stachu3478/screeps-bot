import RepairRoute from './RepairRoute'
import StructureMatcher from '../resourceRoute/matcher/structureMatcher'
import _ from 'lodash'

export default class RoomRepairRoute {
  private roomName: string
  private route: RepairRoute
  private structureMatcher: StructureMatcher

  constructor(room: Room, route: RepairRoute) {
    this.roomName = room.name
    this.route = route
    this.structureMatcher = new StructureMatcher(route.structure)
  }

  hasJob(toSpawn = false) {
    return !!(this.findTargets().length && this.findSources(toSpawn).length)
  }

  findSources(toSpawn = false) {
    const match = this.route.sources.call(this.room) as AnyStoreStructure[]
    return match.filter((s) => this.validateSource(s, toSpawn))
  }

  choose(pos: RoomPosition, opts?: FindPathOpts) {
    const targets = this.findTargets()
    if (!targets.length) return null
    if (this.route.orderByHits) {
      return _.min(targets, (t) => t.hits)
    } else {
      return pos.findClosestByPath(targets, opts)
    }
  }

  findTargets() {
    const match = this.structureMatcher.call(this.room) as Structure<
      BuildableStructureConstant
    >[]
    return match.filter((s) => this.route.validateTarget(s))
  }

  validateSource(s: AnyStoreStructure, toSpawn = false) {
    return this.route.validateSource(s, toSpawn)
  }

  validateTarget(s: Structure<BuildableStructureConstant>) {
    return this.route.validateTarget(s)
  }

  private get room() {
    return Game.rooms[this.roomName]
  }
}
