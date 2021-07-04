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
    if (!this.route.remote) {
      const controller = this.room.controller
      if (!controller) return true
      if (!controller.my) return true
      if (!CONTROLLER_STRUCTURES[this.route.structure][controller.level]) {
        return true
      }
    }
    return !this.route.if(this.room)
  }

  done() {
    this.route.done(this.room)
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
    const positions = this.route.positions(this.room)
    const target = this.findTarget(positions)
    if (target) return target
    else return this.createTarget(positions)
  }

  findTarget(positions: RoomPosition[] = this.positions) {
    let site: ConstructionSite | undefined
    positions.some(
      (pos) =>
        Game.rooms[pos.roomName] &&
        pos
          .lookFor(LOOK_CONSTRUCTION_SITES)
          .some(
            (s) => !!(s.structureType === this.route.structure && (site = s)),
          ),
    )
    return site
  }

  createTarget(positions: RoomPosition[] = this.positions) {
    let result = 1
    positions.some((pos) => {
      if (!Game.rooms[pos.roomName]) {
        return false
      }
      const structuresAt = pos.lookFor(LOOK_STRUCTURES)
      const matchingStructure = pos.building(this.route.structure)
      if (matchingStructure) {
        return false
      }
      if (this.clearSpace(structuresAt)) {
        return true
      }
      result = pos.createConstructionSite(this.route.structure)
      if (result === OK) return true
      if (result === ERR_RCL_NOT_ENOUGH) return true
      if (result === ERR_FULL) return true
      return false
    })
    return result === OK
  }

  private clearSpace(structuresAt: Structure[]) {
    return structuresAt.some((s) => this.exclusiveFor(s) && s.destroy() === OK)
  }

  private exclusiveFor(structure: Structure) {
    if (typeof this.route.exclusive === 'function') {
      return this.route.exclusive(structure)
    }
    return !!this.route.exclusive
  }

  private get room() {
    return Game.rooms[this.roomName]
  }

  private get positions() {
    return this.route.positions(this.room)
  }
}
