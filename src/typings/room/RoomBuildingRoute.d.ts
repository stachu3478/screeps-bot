declare class RoomBuildingRoute {
  skip(): boolean

  findSources(): AnyStoreStructure[]

  validateSource(s: AnyStoreStructure): boolean

  findOrCreateTarget(): ConstructionSite | boolean

  findTarget(): ConstructionSite | undefined

  createTarget(): boolean
}
