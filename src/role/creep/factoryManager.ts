import { DONE, NOTHING_TODO, FAILED, SUCCESS } from 'constants/response'
import draw from 'routine/haul/draw'
import fill from 'routine/haul/fill'
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

export default profiler.registerFN(function factoryManager(
  creep: FactoryManager,
) {
  switch (creep.memory.state) {
    case State.IDLE:
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
          break
      }
      break
    case State.FILL:
      switch (fill(creep)) {
        case DONE:
        case SUCCESS:
          creep.memory.state = State.IDLE
          break
        case NOTHING_TODO:
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
      storageManagement.findJob(creep)
  }
},
'roleFactoryManager')
