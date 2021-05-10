import RepairRoute from './RepairRoute'
import StructureMatcher from '../resourceRoute/matcher/structureMatcher'

export default class RoomRepairRoute {
  private roomName: string
  private route: RepairRoute
  private structureMatcher: StructureMatcher

  constructor(room: Room, route: RepairRoute) {
    this.roomName = room.name
    this.route = route
    this.structureMatcher = new StructureMatcher(route.structure)
  }

  hasJob() {
    return !!(this.findTargets().length && this.findSources().length)
  }

  findSources() {
    const match = this.route.sources.call(this.room) as AnyStoreStructure[]
    return match.filter((s) => this.route.validateSource(s))
  }

  findTargets() {
    const match = this.structureMatcher.call(this.room) as Structure<
      BuildableStructureConstant
    >[]
    return match.filter((s) => this.route.validateTarget(s))
  }

  validateSource(s: AnyStoreStructure) {
    return this.route.validateSource(s)
  }

  validateTarget(s: Structure<BuildableStructureConstant>) {
    return this.route.validateTarget(s)
  }

  private get room() {
    return Game.rooms[this.roomName]
  }
}
