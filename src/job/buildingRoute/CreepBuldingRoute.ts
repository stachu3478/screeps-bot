import BuildingRoute from './BuildingRoute'
import memoryLessDraw from 'routine/haul/memoryLessDraw'
import { NO_RESOURCE } from 'constants/response'
import CreepMemoized from 'utils/CreepMemoized'
import memoryLessBuild from 'routine/work/memoryLessBuild'

export interface BuildingCreep extends Creep {
  memory: BuildingMemory
}

interface BuildingMemory extends CreepMemory {
  [Keys.buildTarget]?: Id<ConstructionSite<BuildableStructureConstant>>
  [Keys.drawSource]?: Id<AnyStoreStructure>
}

const ignoreCreeps = { ignoreCreeps: true }
export default class CreepBuildingRoute extends CreepMemoized<BuildingCreep> {
  private room: Room
  private buildingRoute: BuildingRoute

  constructor(creep: Creep, buildingRoute: BuildingRoute) {
    super(creep)
    this.room = creep.motherRoom
    this.buildingRoute = buildingRoute
  }

  work() {
    const result = this.drawAndBuild()
    if (!result) {
      const creep = this.creep
      delete creep.memory[Keys.buildTarget]
      delete creep.memory[Keys.drawSource]
    }
    return result
  }

  private drawAndBuild() {
    const creep = this.creep
    const target = this.findConstructionSite()
    if (!target) return this.createConstructionSite()
    creep.memory[Keys.buildTarget] = target.id
    const buildResult = memoryLessBuild(creep, target)
    if (buildResult === NO_RESOURCE) {
      const source = this.findStructureToDraw() as AnyStoreStructure | null
      if (!source) {
        console.log('Missing source, cancelling')
        return false
      }
      creep.memory[Keys.drawSource] = source.id
      memoryLessDraw(creep, source, RESOURCE_ENERGY)
    }
    return true
  }

  private findStructureToDraw() {
    const route = this.buildingRoute
    const memory = this.creep.memory
    const id = memory[Keys.drawSource]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && route.validateSource(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      route.findSources(this.room),
      ignoreCreeps,
    )
  }

  private findConstructionSite() {
    const route = this.buildingRoute
    const memory = this.creep.memory
    const id = memory[Keys.buildTarget]
    const memorizedSite = id && Game.getObjectById(id)
    if (memorizedSite) return memorizedSite
    let site: ConstructionSite | undefined
    route
      .positions(this.room)
      .some((pos) =>
        pos.lookFor(LOOK_CONSTRUCTION_SITES).some((s) => !!(site = s)),
      )
    return site
  }

  private createConstructionSite() {
    const route = this.buildingRoute
    let result = 1
    route.positions(this.room).some((pos) => {
      result = pos.createConstructionSite(route.structure)
      if (result === OK) return true
      if (result === ERR_RCL_NOT_ENOUGH) return true
      if (result === ERR_FULL) return true
      return false
    })
    return result === OK
  }
}
