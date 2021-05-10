import routes from '../../config/repairRoutes'
import ArrayLooper from 'utils/ArrayLooper'
import RoomRepairRoute from './RoomRepairRoute'
import { infoStyle } from 'room/style'

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

  findJob() {
    if (this.hasJob()) return this.routesLooper.current
    return !this.routesLooper.end
  }

  hasJob() {
    const i = this.routesLooper.i
    this.room.visual.text('Repair route search ' + i, 0, 10, infoStyle)
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
