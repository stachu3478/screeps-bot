import memoryLessDraw from 'routine/haul/memoryLessDraw'
import { NO_RESOURCE } from 'constants/response'
import CreepMemoized from 'utils/CreepMemoized'
import memoryLessBuild from 'routine/work/memoryLessBuild'
import RoomBuildingRoute from './RoomBuildingRoute'

export interface BuildingCreep extends Creep {
  memory: BuildingMemory
}

interface BuildingMemory extends CreepMemory {
  [Keys.buildTarget]?: Id<ConstructionSite<BuildableStructureConstant>>
  [Keys.drawSource]?: Id<AnyStoreStructure>
}

const ignoreCreeps = { ignoreCreeps: true }
export default class CreepBuildingRoute extends CreepMemoized<BuildingCreep> {
  private route: RoomBuildingRoute

  constructor(creep: Creep, roomBuildingRoute: RoomBuildingRoute) {
    super(creep)
    this.route = roomBuildingRoute
  }

  work() {
    const result = this.drawAndBuild()
    if (!result) {
      const creep = this.creep
      if (creep.memory[Keys.buildTarget]) {
        this.route.done()
      }
      delete creep.memory[Keys.buildTarget]
      delete creep.memory[Keys.drawSource]
    }
    return result
  }

  private drawAndBuild() {
    const creep = this.creep
    const target = this.findConstructionSite()
    if (!target) return this.route.createTarget()
    creep.memory[Keys.buildTarget] = target.id
    const buildResult = memoryLessBuild(creep, target)
    if (buildResult === NO_RESOURCE) {
      const source = this.findStructureToDraw() as AnyStoreStructure | null
      if (!source) return false
      creep.memory[Keys.drawSource] = source.id
      memoryLessDraw(creep, source, RESOURCE_ENERGY)
    }
    return true
  }

  private findStructureToDraw() {
    const memory = this.creep.memory
    const id = memory[Keys.drawSource]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && this.route.validateSource(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      this.route.findSources(),
      ignoreCreeps,
    )
  }

  private findConstructionSite() {
    const memory = this.creep.memory
    const id = memory[Keys.buildTarget]
    const memorizedSite = id && Game.getObjectById(id)
    if (memorizedSite) return memorizedSite
    return this.route.findTarget()
  }
}
