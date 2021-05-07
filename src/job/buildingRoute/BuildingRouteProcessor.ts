import CreepBuildingRoute from './CreepBuldingRoute'
import CreepMemoized from 'utils/CreepMemoized'
import Failer from 'utils/Failer'
import { infoStyle } from 'room/style'

const enum RouteStatusKey {
  id = 2,
}
export default class BuildingRouteProcessor extends CreepMemoized<Creep> {
  private room: Room
  private status: RouteStatus
  private failer: Failer
  private currentRoute?: CreepBuildingRoute

  constructor(creep: Creep) {
    super(creep)
    this.room = creep.motherRoom
    this.status =
      this.creep.memory[Keys.buildingRoute] ||
      (this.creep.memory[Keys.buildingRoute] = [0, Game.time, 0])
    this.failer = new Failer(() => this.findJob(), this.status)
  }

  process() {
    return this.findJob()
  }

  doJob() {
    return !!(this.currentRoute && this.currentRoute.work())
  }

  findJob() {
    if (this.doJob()) return true
    delete this.currentRoute
    const newRoute = this.room.buildingRouter.findJob()
    if (typeof newRoute === 'boolean') return newRoute
    this.currentRoute = new CreepBuildingRoute(
      this.creep,
      // @ts-ignore private property member error
      newRoute,
    )
    this.currentRoute!.work()
    return true
  }
}
