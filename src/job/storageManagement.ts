import { storageBufferingThreshold } from 'config/terminal'
import { FactoryManager } from 'role/creep/factoryManager'

const storageManagement = {
  /*shouldBeTakenToStorage: (
    resource: ResourceConstant,
    terminal: StructureTerminal,
    storage: StructureStorage,
  ) => {
    if (resource === RESOURCE_ENERGY) return 0
    const threshold = storageBufferingThreshold
    return Math.max(
      0,
      Math.min(
        terminal.store[resource] - threshold,
        storage.store.getFreeCapacity(),
      ),
    )
  },

  shouldBeTakenFromStorage: (
    resource: ResourceConstant,
    terminal: StructureTerminal,
    storage: StructureStorage,
  ) => {
    if (resource === RESOURCE_ENERGY) return 0
    const threshold = storageBufferingThreshold
    return Math.max(
      0,
      Math.min(threshold - terminal.store[resource], storage.store[resource]),
    )
  },*/

  prepareToTakeResource: (
    creep: FactoryManager,
    resource: ResourceConstant,
    amount: number,
    from: AnyStoreStructure,
    to: AnyStoreStructure,
  ) => {
    const mem = creep.memory
    mem._draw = from.id
    mem._drawAmount = Math.min(creep.store.getFreeCapacity(), amount)
    mem._drawType = mem[Keys.fillType] = resource
    mem[Keys.fillTarget] = to.id
  },

  /*exchangeTerminalAndStorage: (
    creep: FactoryManager,
    storage: StructureStorage,
    terminal: StructureTerminal,
  ) => {
    return RESOURCES_ALL.some((resource) => {
      const toTake = storageManagement.shouldBeTakenToStorage(
        resource,
        terminal,
        storage,
      )
      if (toTake > 0) {
        storageManagement.prepareToTakeResource(
          creep,
          resource,
          toTake,
          terminal,
          storage,
        )
        return true
      }
      const toFill = storageManagement.shouldBeTakenFromStorage(
        resource,
        terminal,
        storage,
      )
      if (toFill > 0) {
        storageManagement.prepareToTakeResource(
          creep,
          resource,
          toFill,
          storage,
          terminal,
        )
        return true
      }
      return false
    })
  },*/

  /*findJob: (creep: FactoryManager) => {
    const motherRoom = creep.motherRoom
    const storage = motherRoom.storage
    const terminal = motherRoom.terminal
    if (
      storage &&
      terminal &&
      storageManagement.exchangeTerminalAndStorage(creep, storage, terminal)
    )
      return true
    return false
  },*/
}

export default storageManagement
