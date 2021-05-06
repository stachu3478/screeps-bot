import routes from '../../config/resourceRoutes'
import CreepResourceRoute from './CreepResourceRoute'
import CreepMemoized from 'utils/CreepMemoized'
import Failer from 'utils/Failer'

const enum RouteStatusKey {
  id = 2,
}
export default class ResourceRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepResourceRoute[]
  private status: RouteStatus
  private failer: Failer

  constructor(creep: Creep) {
    super(creep)
    this.routes = routes.map((route) => new CreepResourceRoute(creep, route))
    this.status =
      this.creep.memory[Keys.resourceRoute] ||
      (this.creep.memory[Keys.resourceRoute] = [0, Game.time, 0])
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
