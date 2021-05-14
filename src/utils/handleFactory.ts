import { nominalStorage } from 'config/terminal'

export const factoryStoragePerResource = Math.floor(
  FACTORY_CAPACITY / Object.keys(COMMODITIES).length,
)
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
    amount: number
    cooldown: number
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

export function isProducableByFactory(
  resources: StoreDefinition,
  resource: ResourceConstant,
) {
  if (REACTIONS[resource]) return false // we don't produce basic components
  const recipe = com[resource]
  for (const name in recipe.components) {
    const res = name as ResourceConstant
    if ((resources[res] || 0) < recipe.components[res]) return false
  }
  return true
}

function isNeededByFactory(
  resources: StoreDefinition,
  resource: ResourceConstant,
) {
  for (const name in commoditiesComponents[resource]) {
    if (isProducableByFactory(resources, name as ResourceConstant)) {
      return true
    }
  }
  return false
}

export default function handleFactory(
  resources: StoreDefinition,
  factory: StructureFactory,
) {
  const cache = factory.cache
  if (!cache.needs) {
    for (const n in resources) {
      const name = n as ResourceConstant
      if (factory.store[name] >= factoryStoragePerResource) continue
      if (isNeededByFactory(resources, name)) {
        cache.needs = name
        cache.state = State.FACT_BOARD
        break
      }
    }
  }

  if (!cache.dumps) {
    for (const n in factory.store) {
      const name = n as ResourceConstant
      if (resources[name] >= nominalStorage) continue
      if (!isNeededByFactory(factory.store, name)) {
        cache.dumps = name
        break
      }
    }
  }
}
