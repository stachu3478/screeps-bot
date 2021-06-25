import memoryLessDraw from 'routine/haul/memoryLessDraw'
import { NO_RESOURCE } from 'constants/response'
import CreepMemoized from 'utils/CreepMemoized'
import RoomRepairRoute from './RoomRepairRoute'
import memoryLessRepair from 'routine/work/memoryLessRepair'

export interface RepairCreep extends Creep {
  memory: RepairMemory
}

interface RepairMemory extends CreepMemory {
  [Keys.repairTarget]?: Id<Structure<BuildableStructureConstant>>
  [Keys.drawSource]?: Id<AnyStoreStructure>
}

const ignoreCreeps = { ignoreCreeps: true }
export default class CreepRepairRoute extends CreepMemoized<RepairCreep> {
  private route: RoomRepairRoute

  constructor(creep: RepairCreep, roomRepairRoute: RoomRepairRoute) {
    super(creep)
    this.route = roomRepairRoute
  }

  work() {
    const result = this.drawAndRepair()
    if (!result) {
      const creep = this.creep
      delete creep.memory[Keys.repairTarget]
      delete creep.memory[Keys.drawSource]
    }
    return result
  }

  private drawAndRepair() {
    const creep = this.creep
    const target = this.findTarget()
    if (!target) return false
    creep.memory[Keys.repairTarget] = target.id
    const repairResult = memoryLessRepair(creep, target)
    if (repairResult === NO_RESOURCE) {
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

  private findTarget() {
    const memory = this.creep.memory
    const id = memory[Keys.repairTarget]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && this.route.validateTarget(memorizedStructure)) {
      return memorizedStructure
    }
    return this.route.choose(this.creep.pos, ignoreCreeps)
  }
}
