import routes from '../../config/resourceRoutes'
import CreepResourceRoute from './CreepResourceRoute'
import CreepMemoized from 'utils/CreepMemoized'

const enum RouteStatusKey {
  id = 0,
  time = 1,
  timeout = 2,
}
export default class ResourceRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepResourceRoute[]
  private status: RouteStatus

  constructor(creep: Creep) {
    super(creep)
    this.routes = routes.map((route) => new CreepResourceRoute(creep, route))
    this.status =
      this.creep.memory[Keys.resourceRoute] ||
      (this.creep.memory[Keys.resourceRoute] = [0, Game.time, 0])
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
    const res = this.routes.some((route, i) => {
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
