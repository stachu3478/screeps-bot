import routes from '../../config/buildingRoutes'
import ArrayLooper from 'utils/ArrayLooper'
import RoomBuildingRoute from './RoomBuildingRoute'
import { infoStyle } from 'room/style'

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
    this.room.visual.text(
      'Building route search ' + this.routesLooper.i,
      0,
      8,
      infoStyle,
    )
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
