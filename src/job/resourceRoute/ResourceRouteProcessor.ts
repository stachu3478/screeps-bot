import routes from '../../config/resourceRoutes'
import CreepResourceRoute from './CreepResourceRoute'

export default class ResourceRouteProcessor {
  private routes: CreepResourceRoute[]
  private creepName: string

  constructor(creep: Creep) {
    this.routes = routes.map((route) => new CreepResourceRoute(creep, route))
    this.creepName = creep.name
  }

  process() {
    const currentRoute = this.routes[this.creep.memory[Keys.routeId] || 0]
    if (currentRoute.work()) {
      return true
    }
    const res = !!this.routes.find((route, i) => {
      if (route === currentRoute) return false
      if (route.work()) {
        this.creep.memory[Keys.routeId] = i
        return true
      }
      return false
    })
    return res
  }

  private get creep() {
    return Game.creeps[this.creepName]
  }
}
