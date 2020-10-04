import {
  storageBufferingThreshold,
  energyBufferingThreshold,
} from 'config/terminal'
import { FactoryManager } from 'role/creep/factoryManager'

const storageManagement = {
  shouldBeTakenToStorage: (
    resource: ResourceConstant,
    terminal: StructureTerminal,
    storage: StructureStorage,
  ) => {
    const threshold =
      resource === RESOURCE_ENERGY
        ? energyBufferingThreshold
        : storageBufferingThreshold
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
    const threshold =
      resource === RESOURCE_ENERGY
        ? energyBufferingThreshold
        : storageBufferingThreshold
    return Math.max(
      0,
      Math.min(threshold - terminal.store[resource], storage.store[resource]),
    )
  },

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
    mem._drawType = mem._fillType = resource
    mem._fill = to.id
  },

  fillPowerSpawn: (
    creep: FactoryManager,
    terminal: StructureTerminal,
    powerSpawn: StructurePowerSpawn,
  ) => {
    if (
      powerSpawn.store.getFreeCapacity(RESOURCE_POWER) !==
      POWER_SPAWN_POWER_CAPACITY
    )
      return false
    const toFill = Math.min(
      terminal.store[RESOURCE_POWER],
      POWER_SPAWN_POWER_CAPACITY,
    )
    if (toFill === 0) return false
    storageManagement.prepareToTakeResource(
      creep,
      RESOURCE_POWER,
      toFill,
      terminal,
      powerSpawn,
    )
    return true
  },

  exchangeTerminalAndStorage: (
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
  },

  findJob: (creep: FactoryManager) => {
    const motherRoom = creep.motherRoom
    const storage = motherRoom.storage
    const terminal = motherRoom.terminal
    const powerSpawn = motherRoom.powerSpawn
    if (
      storage &&
      terminal &&
      storageManagement.exchangeTerminalAndStorage(creep, storage, terminal)
    )
      return true
    if (
      terminal &&
      powerSpawn &&
      storageManagement.fillPowerSpawn(creep, terminal, powerSpawn)
    )
      return true
    return false
  },
}

export default storageManagement
