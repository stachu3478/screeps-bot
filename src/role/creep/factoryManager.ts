import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw'
import fill from 'routine/haul/fill'
import { factoryStoragePerResource } from 'utils/handleFactory'
import profiler from 'screeps-profiler'
import dumpResources from 'job/dumpResources'
import { getFillableGenericStruture } from 'utils/fill'
import storageManagement from 'job/storageManagement'

export interface FactoryManager extends Creep {
  memory: FactoryManagerMemory
}

interface FactoryManagerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
  [Keys.fillTarget]?: Id<AnyStoreStructure>
  [Keys.fillType]?: ResourceConstant
}

function findJob(creep: FactoryManager) {
  creep.memory.state = State.IDLE
  const motherRoom = creep.motherRoom
  const factory = motherRoom.buildings.factory
  if (!factory) return false
  const cache = factory.cache
  if (!motherRoom.terminal) return false
  if (cache.needs) {
    const type = cache.needs
    const amount = factoryStoragePerResource - factory.store[type]
    if (amount > motherRoom.terminal.store[type]) return false
    storageManagement.prepareToTakeResource(
      creep,
      type,
      amount,
      motherRoom.terminal,
      factory,
    )
    creep.memory.state = State.DRAW
  } else if (cache.dumps) {
    const type = cache.dumps
    const amount = factory.store[type]
    if (amount > motherRoom.terminal.store[type]) return false
    storageManagement.prepareToTakeResource(
      creep,
      type,
      amount,
      factory,
      motherRoom.terminal,
    )
    creep.memory.state = State.DRAW
  } else return false
  return true
}

export default profiler.registerFN(function factoryManager(
  creep: FactoryManager,
) {
  switch (creep.memory.state) {
    case State.IDLE:
      if (findJob(creep)) break
      if (storageManagement.findJob(creep)) {
        creep.memory.state = State.DRAW
        break
      }
      if (creep.store.getUsedCapacity() === 0) {
        creep.memory.role = Role.HARVESTER
        creep.memory._targetRole = Role.HAULER
        const motherRoom = creep.motherRoom
        motherRoom.memory._haul = motherRoom.name
        break
      }
      dumpResources(creep, State.FILL)
      break
    case State.DRAW:
      switch (draw(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.FILL
          break
        case NOTHING_TODO:
        case FAILED:
          creep.memory.state = State.IDLE
          const factoryCache = creep.room.factoryCache
          delete factoryCache.needs
          delete factoryCache.dumps
          break
      }
      break
    case State.FILL:
      switch (fill(creep)) {
        case DONE:
        case SUCCESS:
          const factoryCache = creep.room.factoryCache
          factoryCache.state = State.FACT_BOARD
          creep.room.powerSpawnCache.idle = 0
          delete factoryCache.needs
          delete factoryCache.dumps
          creep.memory.state = State.IDLE
          break
        case NOTHING_TODO:
        case FAILED:
          const storage = getFillableGenericStruture(
            creep.room,
            creep.store.getUsedCapacity(),
          )
          if (!storage) break
          creep.memory[Keys.fillTarget] = storage.id
          break
      }
      break
    default:
      findJob(creep)
  }
},
'roleFactoryManager')
