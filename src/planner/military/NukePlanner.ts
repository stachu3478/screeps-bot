import MyRooms from 'room/MyRooms'
import NukeVoyager from './NukeVoyager'

export default class NukerPlanner {
  private room: Room
  private xys?: [number, number][]
  private nukers: StructureNuker[] = []

  constructor(room: Room) {
    this.room = room
  }

  canNukeSpawns() {
    const nukers = this.availableNukers
    const targets = this.room
      .find(FIND_HOSTILE_SPAWNS)
      .filter((s) => s.owner.username === this.room.owner)
      .map((s) => ({
        x: s.pos.x,
        y: s.pos.y,
        hits: s.effectiveHits,
      }))
    this.xys = new NukeVoyager(targets, nukers.length).search()
    if (!this.xys.length) return false
    return true
  }

  shouldNukeRoom() {
    return (
      !this.room.find(FIND_NUKES).length &&
      this.room.find(FIND_HOSTILE_SPAWNS).some((s) => s.isActive())
    )
  }

  /**
   * Let dat wicked bois get smashed again!
   */
  launch() {
    this.positions.forEach((p, i) => {
      this.nukers[i].launchNuke(new RoomPosition(p[0], p[1], this.room.name))
    })
  }

  get positions() {
    return this.xys || []
  }

  private get availableNukers() {
    return (this.nukers = MyRooms.get()
      .filter((r) => r.location.inRangeTo(this.room, NUKE_RANGE))
      .map((r) => r.buildings.nuker)
      .filter((n) => n?.readyToLaunch) as StructureNuker[])
  }
}
