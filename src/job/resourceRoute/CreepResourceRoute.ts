import memoryLessFill from 'routine/haul/memoryLessFill'
import memoryLessDraw from 'routine/haul/memoryLessDraw'
import dumpResources from '../dumpResources'
import {
  NOTHING_DONE,
  SUCCESS,
  DONE,
  NOTHING_TODO,
  FAILED,
} from 'constants/response'
import move from 'utils/path/path'
import CreepMemoized from 'utils/CreepMemoized'
import RoomResourceRoute from './RoomResourceRoute'
import { FillCreep } from 'routine/haul/fill'

export interface TransferCreep extends FillCreep {
  cache: TransferCache
}

interface TransferCache extends CreepCache {
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
  [Keys.drawSource]?: Id<AnyStoreStructure>
  [Keys.dumping]?: 0 | 1
}

const ignoreCreeps = { ignoreCreeps: true }
export default class CreepResourceRoute extends CreepMemoized<TransferCreep> {
  private route: RoomResourceRoute

  constructor(creep: TransferCreep, resourceRoute: RoomResourceRoute) {
    super(creep)
    this.route = resourceRoute
  }

  work() {
    const result = this.deliverAndDump()
    if (!result) {
      const creep = this.creep
      delete creep.cache[Keys.dumping]
      delete creep.cache[Keys.fillTarget]
      delete creep.cache[Keys.drawSource]
      this.route.done()
    }
    return result
  }

  private deliverAndDump() {
    const creep = this.creep
    if (creep.cache[Keys.dumping]) {
      const id = creep.memory[Keys.fillTarget]
      const structure = id && Game.getObjectById(id)
      const fillType = creep.memory[Keys.fillType]
      if (!fillType) {
        return dumpResources(
          this.creep,
          this.creep.memory.state,
          this.creep.memory.state,
        )
      }
      const res = structure && memoryLessFill(creep, structure, fillType)
      if (res === NOTHING_DONE) return true
      return dumpResources(
        this.creep,
        this.creep.memory.state,
        this.creep.memory.state,
      )
    } else if (!this.drawAndFill()) {
      if (this.ableToDump) {
        return !!(creep.cache[Keys.dumping] = dumpResources(creep) ? 1 : 0)
      }
      return false
    }
    return true
  }

  private drawAndFill() {
    const creep = this.creep
    const target = this.findStructureToFill() as AnyStoreStructure | null
    if (!target) return false
    creep.cache[Keys.fillTarget] = target.id
    const route = this.route
    const toFill = route.fillAmount(target)
    const result = memoryLessFill(creep, target, route.permittedType, toFill)
    if (result === DONE) {
      const source = this.findStructureToDraw() as AnyStoreStructure | null
      if (!source) return false
      creep.cache[Keys.drawSource] = source.id
      memoryLessDraw(
        creep,
        source,
        route.permittedType,
        route.drawAmount(source),
      )
    } else {
      if (result === SUCCESS) this.moveWithSpeculation(target)
    }
    return true
  }

  private moveWithSpeculation(prevTarget: AnyStoreStructure) {
    delete this.creep.cache[Keys.fillTarget]
    const nextTarget = this.findStructureToFill(
      prevTarget,
    ) as AnyStoreStructure | null
    if (nextTarget && !this.creep.pos.isNearTo(nextTarget)) {
      this.creep.cache[Keys.fillTarget] = nextTarget.id
      move.cheap(this.creep, nextTarget)
    }
  }

  private findStructureToDraw() {
    const route = this.route
    const cache = this.creep.cache
    const id = cache[Keys.drawSource]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && route.validateSource(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(route.findSources(), ignoreCreeps)
  }

  private findStructureToFill(differ?: AnyStoreStructure) {
    const route = this.route
    const cache = this.creep.cache
    const id = cache[Keys.fillTarget]
    const memorizedStructure = id && Game.getObjectById(id)
    if (memorizedStructure && route.validateTarget(memorizedStructure))
      return memorizedStructure
    return this.creep.pos.findClosestByPath(
      route.findTargets(differ),
      ignoreCreeps,
    )
  }

  private get ableToDump() {
    // too few dump operations
    return this.route.dump
  }
}
