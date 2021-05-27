import routes from '../../config/resourceRoutes'
import CreepResourceRoute from './CreepResourceRoute'
import CreepMemoized from 'utils/CreepMemoized'
import Failer from 'utils/Failer'
import { infoStyle } from 'room/style'

const enum RouteStatusKey {
  id = 2,
}
export default class ResourceRouteProcessor extends CreepMemoized<Creep> {
  private routes: CreepResourceRoute[]
  private status: RouteStatus
  private failer: Failer
  private i: number
  private jobFound: boolean = false

  constructor(creep: Creep) {
    super(creep)
    this.routes = routes.map((route) => new CreepResourceRoute(creep, route))
    this.status =
      this.creep.memory[Keys.resourceRoute] ||
      (this.creep.memory[Keys.resourceRoute] = [0, Game.time, 0])
    this.i = this.status[RouteStatusKey.id]
    this.failer = new Failer(() => this.findJob(), this.status)
  }

  process() {
    return this.findJob()
  }

  isJobFound() {
    return this.jobFound
  }

  public findJob() {
    const currentRoute = this.routes[this.i]
    this.jobFound = currentRoute && currentRoute.work()
    if (this.jobFound) {
      this.status[RouteStatusKey.id] = this.i
      this.creep.room.visual.text(
        'Resource route processing ' + this.i,
        0,
        9,
        infoStyle,
      )
      return true
    }
    this.creep.room.visual.text(
      'Resource route search ' + this.i,
      0,
      9,
      infoStyle,
    )
    this.i++
    if (this.i >= this.routes.length) {
      this.i = 0
      return false
    }
    return true
  }
}
