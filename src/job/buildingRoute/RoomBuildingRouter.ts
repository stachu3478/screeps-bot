import routes from '../../config/buildingRoutes'
import ArrayLooper from 'utils/ArrayLooper'
import RoomBuildingRoute from './RoomBuildingRoute'

export default class RoomBuildingRouter {
  private routesLooper: ArrayLooper<RoomBuildingRoute>
  private roomRoutes: RoomBuildingRoute[]
  private hadJob: boolean = false

  constructor(room: Room) {
    this.roomRoutes = routes.map((route) => new RoomBuildingRoute(room, route))
    this.routesLooper = new ArrayLooper(this.roomRoutes, 0 /* TODO: memorize */)
  }

  hasJob() {
    if (this.hadJob) {
      return (this.hadJob = this.routesLooper.current.hasJob())
    } else {
      return (this.hadJob = this.routesLooper.next.hasJob())
    }
  }

  get routes() {
    return this.roomRoutes
  }
}
