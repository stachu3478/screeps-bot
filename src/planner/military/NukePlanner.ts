import NukeVoyager from './NukeVoyager'

export default class NukerPlanner {
  private room: Room
  private xys?: [number, number][]

  constructor(room: Room) {
    this.room = room
  }

  canNukeSpawns() {
    const nukers = this.availableNukers
    const targets = this.room.find(FIND_HOSTILE_SPAWNS).map((s) => ({
      x: s.pos.x,
      y: s.pos.y,
      hits: s.effectiveHits,
    }))
    this.xys = new NukeVoyager(targets, nukers.length).search()
    if (!this.xys.length) return false
    return true
  }

  get positions() {
    return this.xys || []
  }

  private get availableNukers() {
    return Object.keys(Memory.myRooms)
      .map((r) => Game.rooms[r])
      .filter((r) => r?.location.inRangeTo(this.room, NUKE_RANGE))
      .map((r) => r.buildings.nuker)
      .filter((n) => n?.readyToLaunch) as StructureNuker[]
  }
}
