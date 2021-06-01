import routes from '../../config/routes/resource'
import CreepResourceRoute from './CreepResourceRoute'
import CreepMemoized from 'utils/CreepMemoized'
import RoomResourceRoute from './RoomResourceRoute'

const enum RouteStatusKey {
  id = 2,
}
export default class ResourceRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepResourceRoute[]
  private status: RouteStatus
  private i: number
  private jobFound: boolean = false

  constructor(creep: Creep) {
    super(creep)
    this.routes = routes.map(
      (route) =>
        new CreepResourceRoute(
          creep,
          new RoomResourceRoute(creep.motherRoom, route),
        ),
    )
    this.status =
      this.creep.memory[Keys.resourceRoute] ||
      (this.creep.memory[Keys.resourceRoute] = [0, Game.time, 0])
    this.i = this.status[RouteStatusKey.id]
  }

  process() {
    return this.findJob()
  }

  isJobFound() {
    return this.jobFound
  }

  public findJob() {
    const currentRoute = this.routes[this.i]
    this.jobFound = this.i !== 13 && currentRoute && currentRoute.work()
    // route id 13 always has bugs idk
    if (this.jobFound) {
      this.status[RouteStatusKey.id] = this.i
      this.creep.room.visual.info('Resource route processing ' + this.i, 0, 9)
      return true
    }
    this.creep.room.visual.info('Resource route search ' + this.i, 0, 9)
    this.i++
    if (this.i >= this.routes.length) {
      this.i = 0
      return false
    }
    return true
  }
}
