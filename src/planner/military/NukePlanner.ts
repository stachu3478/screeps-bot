export default class NukerPlanner {
  private room: Room

  constructor(room: Room) {
    this.room = room
  }

  canNukeSpawns() {}

  private canBeNuked() {
    const availableNukers = this.availableNukers
  }

  private get availableNukers() {
    return Object.keys(Memory.myRooms)
      .map((r) => Game.rooms[r])
      .filter((r) => r?.location.inRangeTo(this.room, NUKE_RANGE))
      .map((r) => r.buildings.nuker)
      .filter((n) => n?.readyToLaunch) as StructureNuker[]
  }
}
