import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw';
import fill from 'routine/haul/fill';
import { factoryStoragePerResource } from 'utils/handleFactory';
import profiler from "screeps-profiler"
import dumpResources from 'job/dumpResources';
import { getFillableGenericStruture } from 'utils/fill';
import storageManagement from 'job/storageManagement';

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
  creep.memory.state = State.IDLE
  const motherRoom = creep.motherRoom
  const factory = motherRoom.factory
  if (!factory) return false
  if (!motherRoom.terminal) return false
  if (motherRoom.memory.factoryNeeds) {
    const type = motherRoom.memory.factoryNeeds
    const amount = factoryStoragePerResource - factory.store[type]
    if (amount > motherRoom.terminal.store[type]) return false
    storageManagement.prepareToTakeResource(creep, type, amount, motherRoom.terminal, factory)
    creep.memory.state = State.DRAW
  } else if (motherRoom.memory.factoryDumps) {
    const type = motherRoom.memory.factoryDumps
    const amount = factory.store[type]
    if (amount > motherRoom.terminal.store[type]) return false
    storageManagement.prepareToTakeResource(creep, type, amount, factory, motherRoom.terminal)
    creep.memory.state = State.DRAW
  } else return false
  return true
}

export default profiler.registerFN(function factoryManager(creep: FactoryManager) {
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
        case DONE: case SUCCESS:
          creep.memory.state = State.FILL
          break
        case NOTHING_TODO: case FAILED:
          creep.memory.state = State.IDLE
          delete creep.room.memory.factoryNeeds
          delete creep.room.memory.factoryDumps
          break
      }
      break
    case State.FILL:
      switch (fill(creep)) {
        case DONE: case SUCCESS:
          creep.room.memory.factoryState = State.FACT_BOARD
          creep.room.memory[Keys.powerSpawnIdle] = 0
          delete creep.room.memory.factoryNeeds
          delete creep.room.memory.factoryDumps
          creep.memory.state = State.IDLE
          break
        case NOTHING_TODO: case FAILED:
          const storage = getFillableGenericStruture(creep.room, creep.store.getUsedCapacity())
          if (!storage) break
          creep.memory._fill = storage.id
          break
      }
      break
    default: findJob(creep)
  }
}, 'roleFactoryManager')
