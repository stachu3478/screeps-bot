declare class BuildingRouteProcessor {
  constructor(creep: Creep)
  doJob(): boolean
  process(): boolean
  found: boolean
}
