import FactoryRoute, {
  CommodityComponents,
  COMMODITY_RESOURCES,
} from 'job/factoryRoute/FactoryRoute'
import _ from 'lodash'
import { factoryStoragePerResource } from 'utils/handleFactory'

const isDecompressingRecipe = (commodity: CommodityConstant) => {
  // @ts-ignore invalid commodity -> COMMODITIES typing
  return commodity.length === 1 || commodity === RESOURCE_ENERGY
}
const isCompressingRecipe = (recipe: CommodityComponents) => {
  const componentTypes = Object.keys(recipe) as CommodityConstant[]
  return componentTypes.every((t) => compressableMinerals.indexOf(t) !== -1)
}
const compressableMinerals = COMMODITY_RESOURCES.filter((c) =>
  isDecompressingRecipe(c),
)
const routes = [
  {
    // decompress minerals and energy if too much in
    make: compressableMinerals,
    minComponentAmount: factoryStoragePerResource + 100,
  },
  {
    // compress minerals and energy  if too low in
    make: COMMODITY_RESOURCES.filter((r) =>
      isCompressingRecipe(COMMODITIES[r].components),
    ),
    maxAmount: factoryStoragePerResource,
  },
  {
    // make everything other without limits
    make: COMMODITY_RESOURCES.filter(
      (r) =>
        !isDecompressingRecipe(r) &&
        !isCompressingRecipe(COMMODITIES[r].components),
    ),
  },
].map((o) => new FactoryRoute(o))
export default routes
