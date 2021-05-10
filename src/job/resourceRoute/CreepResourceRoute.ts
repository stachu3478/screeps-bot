import ResourceRoute from './ResourceRoute'
import memoryLessFill from 'routine/haul/memoryLessFill'
import memoryLessDraw from 'routine/haul/memoryLessDraw'
import dumpResources from '../dumpResources'
import { NOTHING_DONE, SUCCESS } from 'constants/response'
import move from 'utils/path'
import CreepMemoized from 'utils/CreepMemoized'

export interface TransferCreep extends Creep {
  memory: TransferMemory
}

interface TransferMemory extends CreepMemory {
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
  [Keys.drawSource]?: Id<AnyStoreStructure>
  [Keys.dumping]?: 0 | 1
}

const ignoreCreeps = { ignoreCreeps: true }
export default class CreepResourceRoute extends CreepMemoized<TransferCreep> {
  private room: Room
  private resourceRoute: ResourceRoute

  constructor(creep: TransferCreep, resourceRoute: ResourceRoute) {
    super(creep)
    this.room = creep.motherRoom
    this.resourceRoute = resourceRoute
  }

  work() {
    const result = this.deliverAndDump()
    if (!result) {
      const creep = this.creep
      delete creep.memory[Keys.dumping]
      delete creep.memory[Keys.fillTarget]
      delete creep.memory[Keys.drawSource]
    }
    return result
  }

  private deliverAndDump() {
    const creep = this.creep
    if (creep.memory[Keys.dumping]) {
      const id = creep.memory[Keys.fillTarget]
      const structure = id && Game.getObjectById(id)
      const res =
        structure &&
        memoryLessFill(creep, structure, creep.memory[Keys.fillType] || 'X')
      if (res === NOTHING_DONE) return true
      return dumpResources(this.creep)
    } else if (!this.drawAndFill()) {
      if (this.resourceRoute.dump) {
        return !!(creep.memory[Keys.dumping] = dumpResources(creep) ? 1 : 0)
      }
      return false
    }
    return true
  }

  private drawAndFill() {
    const creep = this.creep
    if (creep.name !== 'J12') return
    const target = this.findStructureToFill() as AnyStoreStructure | null
    if (!target) return false
    creep.memory[Keys.fillTarget] = target.id
    const route = this.resourceRoute
    const resource = route.findStoredResource(creep)
    if (resource) {
      const fillAmount = route.fillAmount(target, resource)
      if (fillAmount < 0) return false
      console.log('fill', creep, target, resource, fillAmount)
      const result = memoryLessFill(creep, target, resource, fillAmount)
      if (result === SUCCESS) this.moveWithSpeculation(target)
    } else {
      const source = this.findStructureToDraw() as AnyStoreStructure | null
      if (!source) return false
      creep.memory[Keys.drawSource] = source.id
      const resourceToDraw = route.findValidResource(source) || 'X'
      if (!creep.store.getFreeCapacity()) return false
      const drawAmount = route.drawAmount(source, resourceToDraw)
      console.log('draw', creep, source, resourceToDraw, drawAmount)
      memoryLessDraw(creep, source, resourceToDraw, drawAmount)
    }
    return true
  }

  private moveWithSpeculation(prevTarget: AnyStoreStructure) {
    delete this.creep.memory[Keys.fillTarget]
    const nextTarget = this.findStructureToFill(
      prevTarget,
    ) as AnyStoreStructure | null
    if (nextTarget && !this.creep.pos.isNearTo(nextTarget)) {
      this.creep.memory[Keys.fillTarget] = nextTarget.id
      move.cheap(this.creep, nextTarget)
    }
  }

  private findStructureToDraw() {
    const route = this.resourceRoute
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

  private findStructureToFill(differ?: AnyStoreStructure) {
    const route = this.resourceRoute
    const memory = this.creep.memory
    const id = memory[Keys.fillTarget]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && route.validateTarget(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      route.findTargets(this.room, differ),
      ignoreCreeps,
    )
  }
}
