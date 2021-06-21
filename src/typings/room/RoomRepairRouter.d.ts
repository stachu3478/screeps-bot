declare class RoomRepairRouter {
  findJob(): RoomRepairRoute | boolean
  hasJob(toSpawn?: boolean): boolean
  routes: RoomRepairRoute[]
}
