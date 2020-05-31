import { HAUL_FACTORY_FROM_TERMINAL, HAUL_TERMINAL_TO_FACTORY, HAUL_TERMINAL_FROM_FACTORY, HAUL_FACTORY_TO_TERMINAL, FACT_BOARD, IDLE } from 'constants/state'
import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw';
import fill from 'routine/haul/fill';
import { factoryStoragePerResource } from 'utils/handleFactory';
import profiler from "screeps-profiler"
import { HARVESTER } from 'constants/role';
import dumpResources from 'job/dumpResources';

export interface FactoryManager extends Creep {
  memory: FactoryManagerMemory
}

interface FactoryManagerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
  _drawAmount?: number
  _drawType?: ResourceConstant
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
}

function findJob(creep: FactoryManager) {
  creep.memory.state = IDLE
  const factory = creep.room.factory
  if (!factory) return false
  if (!creep.room.terminal) return false
  if (creep.room.memory.factoryNeeds) {
    const type = creep.room.memory.factoryNeeds
    creep.memory._draw = creep.room.terminal.id
    creep.memory._drawType = type
    creep.memory._drawAmount = factoryStoragePerResource - factory.store[type]
    creep.memory.state = HAUL_FACTORY_FROM_TERMINAL
  } else if (creep.room.memory.factoryDumps) {
    const type = creep.room.memory.factoryDumps
    creep.memory._draw = factory.id
    creep.memory._drawType = type
    creep.memory._drawAmount = factory.store[type]
    creep.memory.state = HAUL_TERMINAL_FROM_FACTORY
  } else return false
  return true
}

export default profiler.registerFN(function factoryManager(creep: FactoryManager) {
  switch (creep.memory.state) {
    case IDLE:
      if (findJob(creep)) break
      if (creep.store.getUsedCapacity() === 0) {
        creep.memory.role = HARVESTER
        break
      }
      dumpResources(creep, HAUL_FACTORY_TO_TERMINAL)
      break
    case HAUL_FACTORY_FROM_TERMINAL:
      switch (draw(creep)) {
        case DONE: case SUCCESS:
          const factory = creep.room.factory
          if (factory) {
            creep.memory._fill = factory.id
            creep.memory._fillType = creep.room.memory.factoryNeeds
            creep.memory.state = HAUL_TERMINAL_TO_FACTORY
          } else creep.memory.state = HAUL_FACTORY_TO_TERMINAL
          break
        case NOTHING_TODO: case FAILED:
          creep.memory.state = IDLE
          delete creep.room.memory.factoryNeeds
          break
      }
      break
    case HAUL_TERMINAL_TO_FACTORY:
      switch (fill(creep)) {
        case DONE: case SUCCESS:
          creep.room.memory.factoryState = FACT_BOARD
          delete creep.room.memory.factoryNeeds
          creep.memory.state = IDLE
          break
        case NOTHING_TODO: case FAILED:
          if (!creep.room.terminal) break
          creep.memory._fill = creep.room.terminal.id
          creep.memory.state = HAUL_FACTORY_TO_TERMINAL
          break
      }
      break
    case HAUL_TERMINAL_FROM_FACTORY:
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          if (creep.room.terminal) {
            creep.memory._fill = creep.room.terminal.id
            creep.memory._fillType = creep.room.memory.factoryDumps
            creep.memory.state = HAUL_FACTORY_TO_TERMINAL
          } else creep.memory.state = HAUL_TERMINAL_TO_FACTORY
        } break
        case NOTHING_TODO: case FAILED: {
          creep.memory.state = IDLE
          delete creep.room.memory.factoryDumps
        }; break
      }
      break
    case HAUL_FACTORY_TO_TERMINAL:
      switch (fill(creep)) {
        case DONE: case SUCCESS:
          delete creep.room.memory.factoryDumps
          creep.memory.state = IDLE
          break
        case NOTHING_TODO: case FAILED:
          const factory = creep.room.factory
          if (!factory) break
          creep.memory._fill = factory.id
          creep.memory.state = HAUL_TERMINAL_TO_FACTORY
          break
      }
      break
    default: findJob(creep)
  }
}, 'roleFactoryManager')
