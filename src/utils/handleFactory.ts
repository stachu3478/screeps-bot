export const factoryStoragePerResource = Math.floor(
  FACTORY_CAPACITY / Object.keys(COMMODITIES).length,
)

export default function handleFactory(factory: StructureFactory) {
  factory.reloadNeeds()
  factory.reloadDumps()
}
