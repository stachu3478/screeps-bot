import CreepRepairRoute, { RepairCreep } from './CreepRepairRoute'
import CreepMemoized from 'utils/CreepMemoized'

export default class RepairRouteProcessor extends CreepMemoized<Creep> {
  private room: Room
  private currentRoute?: CreepRepairRoute
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
    const newRoute = this.room.repairRouter.findJob()
    if (typeof newRoute === 'boolean') return newRoute
    this.currentRoute = new CreepRepairRoute(
      this.creep as RepairCreep,
      // @ts-ignore private property failcheck
      newRoute,
    )
    this.currentRoute!.work()
    return true
  }

  get found() {
    return this.jobFound
  }
}
