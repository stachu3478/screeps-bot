import routes from '../../config/routes/repair'
import ArrayLooper from 'utils/ArrayLooper'
import RoomRepairRoute from './RoomRepairRoute'

export default class RoomRepairRouter {
  private routesLooper: ArrayLooper<RoomRepairRoute>
  private roomRoutes: RoomRepairRoute[]
  private hadJob: boolean = false
  private room: Room

  constructor(room: Room) {
    this.room = room
    this.roomRoutes = routes.map((route) => new RoomRepairRoute(room, route))
    this.routesLooper = new ArrayLooper(this.roomRoutes, 0 /* TODO: memorize */)
  }

  findJob(toSpawn = false) {
    if (this.hasJob(toSpawn)) return this.routesLooper.current
    return !this.routesLooper.end
  }

  hasJob(toSpawn = false) {
    const i = this.routesLooper.i
    this.room.visual.info('Repair route search ' + i, 0, 10)
    if (this.hadJob) {
      return (this.hadJob = this.routesLooper.current.hasJob(toSpawn))
    } else {
      return (this.hadJob = this.routesLooper.next.hasJob(toSpawn))
    }
  }

  get routes() {
    return this.roomRoutes
  }
}
