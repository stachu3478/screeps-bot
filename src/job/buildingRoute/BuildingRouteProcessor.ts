import CreepBuildingRoute from './CreepBuldingRoute'
import CreepMemoized from 'utils/CreepMemoized'
import ProfilerPlus from 'utils/ProfilerPlus'

export default class BuildingRouteProcessor extends CreepMemoized<Creep> {
  private room: Room
  private currentRoute?: CreepBuildingRoute
  private jobFound: boolean = false

  constructor(creep: Creep) {
    super(creep)
    this.room = creep.motherRoom
  }

  process() {
    return this.findJob()
  }

  doJob() {
    return (this.jobFound = !!(this.currentRoute && this.currentRoute.work()))
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

  get found() {
    return this.jobFound
  }
}

// ProfilerPlus.instance.overrideObject(BuildingRouteProcessor, 'BuildingRouteProcessor')
