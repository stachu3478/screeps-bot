import routes from '../../config/routes/building'
import ArrayLooper from 'utils/ArrayLooper'
import RoomBuildingRoute from './RoomBuildingRoute'

export default class RoomBuildingRouter {
  private routesLooper: ArrayLooper<RoomBuildingRoute>
  private roomRoutes: RoomBuildingRoute[]
  private hadJob: boolean = false
  private room: Room

  constructor(room: Room) {
    this.room = room
    this.roomRoutes = routes.map((route) => new RoomBuildingRoute(room, route))
    this.routesLooper = new ArrayLooper(this.roomRoutes, 0 /* TODO: memorize */)
  }

  findJob() {
    if (this.hasJob()) return this.routesLooper.current
    return !this.routesLooper.end
  }

  hasJob() {
    this.room.visual.info('Building route search ' + this.routesLooper.i, 0, 8)
    if (this.hadJob) {
      return (this.hadJob = this.routesLooper.current.hasJob())
    } else {
      return (this.hadJob = this.routesLooper.next.hasJob())
    }
  }

  get found() {
    return this.hadJob
  }

  get routes() {
    return this.roomRoutes
  }
}
