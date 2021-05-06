import routes from '../../config/buildingRoutes'
import CreepBuildingRoute from './CreepBuldingRoute'
import CreepMemoized from 'utils/CreepMemoized'

const enum RouteStatusKey {
  id = 0,
  time = 1,
  timeout = 2,
}
export default class BuildingRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepBuildingRoute[]
  private status: RouteStatus

  constructor(creep: Creep) {
    super(creep)
    this.routes = routes.map((route) => new CreepBuildingRoute(creep, route))
    this.status =
      this.creep.memory[Keys.buildingRoute] ||
      (this.creep.memory[Keys.buildingRoute] = [0, Game.time, 0])
  }

  process() {
    if (Game.time < this.status[RouteStatusKey.timeout]) return false
    const result = this.findJob()
    if (result) {
      this.status[RouteStatusKey.timeout] = 0
    } else {
      this.status[RouteStatusKey.timeout]++
      this.status[RouteStatusKey.time] =
        Game.time + this.status[RouteStatusKey.timeout]
    }
    return result
  }

  findJob() {
    const currentRoute = this.routes[this.status[RouteStatusKey.id]]
    if (currentRoute && currentRoute.work()) {
      return true
    }
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
