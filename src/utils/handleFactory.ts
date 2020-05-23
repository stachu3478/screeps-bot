import { storagePerResource } from './handleTerminal';
import { FACT_BOARD } from 'constants/state';

export const factoryStoragePerResource = Math.floor(FACTORY_CAPACITY / Object.keys(COMMODITIES).length)
export const com = COMMODITIES as CommoMap

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

export function isProducableByFactory(resources: ResourceMap, resource: ResourceConstant) {
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
