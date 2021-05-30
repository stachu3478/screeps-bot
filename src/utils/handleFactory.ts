import { nominalStorage } from 'config/terminal'

export const factoryStoragePerResource = Math.floor(
  FACTORY_CAPACITY / Object.keys(COMMODITIES).length,
)
export const com = COMMODITIES as CommoMap

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

export default function handleFactory(factory: StructureFactory) {
  const cache = factory.cache
  if (!cache.needs) {
    cache.needs = factory.router.findNeededRecipeComponent()
  }
  if (!cache.dumps) {
    cache.dumps = factory.router.findNeededRecipeComponent()
  }
}
