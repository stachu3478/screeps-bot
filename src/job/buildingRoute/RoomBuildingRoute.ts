import BuildingRoute from './BuildingRoute'

export default class RoomBuildingRoute {
  private roomName: string
  private route: BuildingRoute

  constructor(room: Room, route: BuildingRoute) {
    this.roomName = room.name
    this.route = route
  }

  /**
   * Checks wherever the route processing should be skipped
   */
  skip() {
    const controller = this.room.controller
    if (!controller) return true
    if (!controller.my) return true
    if (!CONTROLLER_STRUCTURES[this.route.structure][controller.level])
      return true
    return false
  }

  hasJob() {
    return !!(this.findOrCreateTarget() && this.findSources().length)
  }

  findSources() {
    const match = this.route.sources.call(this.room) as AnyStoreStructure[]
    return match.filter((s) => this.validateSource(s))
  }

  validateSource(s: AnyStoreStructure) {
    return this.route.validateSource(s)
  }

  findOrCreateTarget() {
    const target = this.findTarget()
    if (target) return target
    else return this.createTarget()
  }

  findTarget() {
    let site: ConstructionSite | undefined
    this.route
      .positions(this.room)
      .some((pos) =>
        pos
          .lookFor(LOOK_CONSTRUCTION_SITES)
          .some(
            (s) => !!(s.structureType === this.route.structure && (site = s)),
          ),
      )
    return site
  }

  createTarget() {
    let result = 1
    this.route.positions(this.room).some((pos) => {
      result = pos.createConstructionSite(this.route.structure)
      if (result === OK) return true
      if (result === ERR_RCL_NOT_ENOUGH) return true
      if (result === ERR_FULL) return true
      return false
    })
    return result === OK
  }

  private get room() {
    return Game.rooms[this.roomName]
  }
}
