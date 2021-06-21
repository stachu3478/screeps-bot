declare class RepairRouteProcessor {
  constructor(creep: Creep)
  process(): boolean
  doJob(): boolean
  findJob(): boolean
  found: boolean
}
