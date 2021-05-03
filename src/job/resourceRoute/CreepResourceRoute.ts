import ResourceRoute from './ResourceRoute'
import memoryLessFill from 'routine/haul/memoryLessFill'
import memoryLessDraw from 'routine/haul/memoryLessDraw'
import dumpResources from '../dumpResources'
import { NOTHING_DONE, SUCCESS } from 'constants/response'
import move from 'utils/path'

export interface TransferCreep extends Creep {
  memory: TransferMemory
}

interface TransferMemory extends CreepMemory {
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
  [Keys.drawSource]?: Id<AnyStoreStructure | Tombstone | Ruin>
  [Keys.dumping]?: 0 | 1
}

export default class CreepResourceRoute {
  private creepName: string
  private room: Room
  private resourceRoute: ResourceRoute

  constructor(creep: TransferCreep, resourceRoute: ResourceRoute) {
    this.creepName = creep.name
    this.room = creep.motherRoom
    this.resourceRoute = resourceRoute
  }

  work() {
    if (this.creep.memory[Keys.dumping]) {
      const structure = this.findMemorizedStructure(
        this.creep.memory[Keys.fillTarget],
      )
      const res =
        structure &&
        memoryLessFill(
          this.creep,
          structure as AnyStoreStructure,
          this.creep.memory[Keys.fillType] || 'energy',
          true,
        )
      console.log('dumping ' + this.creep.name, structure, res)
      if (res === NOTHING_DONE) return true
      if (!dumpResources(this.creep)) {
        this.creep.memory[Keys.dumping] = 0
        delete this.creep.memory[Keys.fillTarget]
        delete this.creep.memory[Keys.drawSource]
        return false
      }
    } else if (!this.drawAndFill()) {
      delete this.creep.memory[Keys.fillTarget]
      delete this.creep.memory[Keys.drawSource]
      if (this.resourceRoute.dump) {
        return (this.creep.memory[Keys.dumping] = dumpResources(this.creep)
          ? 1
          : 0)
      }
      return false
    }
    return true
  }

  private drawAndFill() {
    const target = this.findStructureToFill() as AnyStoreStructure | null
    if (!target) return false
    this.creep.memory[Keys.fillTarget] = target.id
    const route = this.resourceRoute
    if (this.creep.store[this.resourceRoute.type]) {
      const result = memoryLessFill(this.creep, target, route.type, true)
      if (result === SUCCESS) this.moveWithSpeculation(target)
    } else {
      const source = this.findStructureToDraw() as AnyStoreStructure | null
      if (!source) return false
      this.creep.memory[Keys.drawSource] = source.id
      memoryLessDraw(this.creep, source, route.type)
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
      move.cheap(this.creep, prevTarget)
    }
  }

  private findStructureToDraw() {
    const route = this.resourceRoute
    const memory = this.creep.memory
    const memorizedStructure = this.findMemorizedStructure(
      memory[Keys.drawSource],
    )
    if (memorizedStructure && this.validateSource(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      this.room.find(FIND_STRUCTURES).filter((s) => {
        if (s.structureType !== route.from) return false
        return this.validateSource(s as AnyStoreStructure)
      }),
      { ignoreCreeps: true },
    )
  }

  private findStructureToFill(differ?: AnyStoreStructure) {
    const route = this.resourceRoute
    const memory = this.creep.memory
    const memorizedStructure = this.findMemorizedStructure(
      memory[Keys.fillTarget],
    )
    if (
      memorizedStructure &&
      this.validateTarget(memorizedStructure as AnyStoreStructure)
    )
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      this.room.find(FIND_STRUCTURES).filter((s) => {
        if (s.structureType !== route.to || s === differ) return false
        return this.validateTarget(s as AnyStoreStructure)
      }),
      { ignoreCreeps: true },
    )
  }

  private findMemorizedStructure(
    id?: Id<AnyStoreStructure | Tombstone | Ruin>,
  ) {
    return id && Game.getObjectById(id)
  }

  private validateSource(s: AnyStoreStructure | Tombstone | Ruin) {
    const route = this.resourceRoute
    return (s.store[route.type] || 0) >= route.minimalStoreToDraw
  }

  private validateTarget(s: AnyStoreStructure) {
    const route = this.resourceRoute
    return (
      (s.store.getFreeCapacity(route.type) || 0) >=
      route.minimalFreeCapacityToFill
    )
  }

  private get creep() {
    return Game.creeps[this.creepName] as TransferCreep
  }
}
