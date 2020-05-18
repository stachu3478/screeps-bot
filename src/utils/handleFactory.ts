import { storagePerResource } from './handleTerminal';
import { IDLE, FACT_WORKING, FACT_BOARD } from 'constants/state';
import { infoStyle } from 'room/style';

export const factoryStoragePerResource = Math.floor(FACTORY_CAPACITY / Object.keys(COMMODITIES).length)
const com = COMMODITIES as CommoMap

interface ResourceMap {
  [key: string]: number
}

interface ComponentMap {
  [key: string]: {
    [key: string]: number
  }
}

interface CommoMap {
  [key: string]: {
    level?: number
    amount: number,
    cooldown: number,
    components: {
      [key: string]: number
    }
  }
}

const commoditiesComponents: ComponentMap = {}
for (const name in com) {
  if (REACTIONS[name]) continue // we don't produce basic components
  const recipe = com[name].components
  for (const component in recipe) {
    if (!commoditiesComponents[component]) commoditiesComponents[component] = {}
    commoditiesComponents[component][name] = recipe[component]
  }
}

function isProducableByFactory(resources: ResourceMap, resource: ResourceConstant) {
  if (REACTIONS[resource]) return false // we don't produce basic components
  const recipe = com[resource]
  for (const name in recipe.components) {
    if ((resources[name] || 0) < recipe.components[name]) return false
  }
  return true
}

function isNeededByFactory(resources: ResourceMap, resource: ResourceConstant) {
  for (const name in commoditiesComponents[resource]) {
    if (isProducableByFactory(resources, name as ResourceConstant)) {
      return true
    }
  }
  return false
}

export function factory(factory: StructureFactory) {
  const mem = factory.room.memory
  switch (mem.factoryState) {
    case IDLE: {
      factory.room.visual.text('Factory: Idle', 0, 6, infoStyle)
    } break
    case FACT_BOARD: {
      factory.room.visual.text('Factory: Withdrawing', 0, 6, infoStyle)
      mem.factoryState = FACT_WORKING
    } break
    case FACT_WORKING: {
      if (factory.cooldown) return
      if (!mem.factoryProducing) {
        for (const name in com) {
          if (factory.store[name as ResourceConstant] >= factoryStoragePerResource) continue
          if (REACTIONS[name]) continue
          if (name === RESOURCE_ENERGY) continue
          if (com[name].level && factory.level !== com[name].level) continue
          if (isProducableByFactory(factory.store, name as ResourceConstant)) {
            mem.factoryProducing = name as ResourceConstant
          }
        }
        mem.factoryState = IDLE
        if (factory.room.terminal) handleFactory(factory.room.terminal.store, factory)
        else if (factory.room.storage) handleFactory(factory.room.storage.store, factory)
        break
      }
      // @ts-ignore no generic type for produced factory resource
      const result = factory.produce(mem.factoryProducing)
      factory.room.visual.text('Factory: Producing ' + mem.factoryProducing, 0, 6, infoStyle)
      if (result === ERR_NOT_ENOUGH_RESOURCES) delete mem.factoryProducing
    } break
    default: mem.factoryState = IDLE
  }
}

export default function handleFactory(resources: ResourceMap, factory: StructureFactory) {
  const mem = factory.room.memory
  if (!mem.factoryNeeds) {
    for (const n in resources) {
      const name = n as ResourceConstant
      if (factory.store[name] >= factoryStoragePerResource) continue
      if (isNeededByFactory(resources, name)) {
        mem.factoryNeeds = name
        mem.factoryState = FACT_BOARD
        break
      }
    }
  }

  if (!mem.factoryDumps) {
    for (const n in factory.store) {
      const name = n as ResourceConstant
      if (resources[name] >= storagePerResource) continue
      if (!isNeededByFactory(factory.store, name)) {
        mem.factoryDumps = name
        break
      }
    }
  }
}
