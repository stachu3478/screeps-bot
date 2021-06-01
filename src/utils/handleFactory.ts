export const factoryStoragePerResource = Math.floor(
  FACTORY_CAPACITY / Object.keys(COMMODITIES).length,
)

export default function handleFactory(factory: StructureFactory) {
  const cache = factory.cache
  if (!cache.needs) {
    cache.needs = factory.router.findNeededRecipeComponent()
  }
  if (!cache.dumps) {
    cache.dumps = factory.router.findNotNeededRecipeComponent()
  }
}
