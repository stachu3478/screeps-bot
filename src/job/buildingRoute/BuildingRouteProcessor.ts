import CreepBuildingRoute from './CreepBuldingRoute'
import CreepMemoized from 'utils/CreepMemoized'
import Failer from 'utils/Failer'
import { infoStyle } from 'room/style'

const enum RouteStatusKey {
  id = 2,
}
export default class BuildingRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepBuildingRoute[]
  private status: RouteStatus
  private failer: Failer

  constructor(creep: Creep) {
    super(creep)
    const room = creep.motherRoom
    this.routes = room.buildingRouter.routes.map(
      (route) =>
        new CreepBuildingRoute(
          creep,
          // @ts-ignore private property member error
          route,
        ),
    )
    this.status =
      this.creep.memory[Keys.buildingRoute] ||
      (this.creep.memory[Keys.buildingRoute] = [0, Game.time, 0])
    this.failer = new Failer(() => this.findJob(), this.status)
  }

  process() {
    return this.failer.call()
  }

  findJob() {
    const currentRoute = this.routes[this.status[RouteStatusKey.id]]
    if (currentRoute && currentRoute.work()) {
      return true
    }
    this.creep.room.visual.text('Building route search', 0, 8, infoStyle)
    const res = !!this.routes.find((route, i) => {
      if (route === currentRoute) return false
      if (route.work()) {
        this.status[RouteStatusKey.id] = i
        return true
      }
      return false
    })
    return res
  }
}
