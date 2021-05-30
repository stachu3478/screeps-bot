import _ from 'lodash'

export type CommodityComponents = Record<
  CommodityConstant | MineralConstant | 'G' | 'energy' | DepositConstant,
  number
>
export const COMMODITY_RESOURCES = _.keys(COMMODITIES) as CommodityConstant[]
interface FactoryRouteOptions {
  /**
   * Specifies commoditidy types to make
   */
  make: CommodityConstant[]
  /**
   * Specifies maximum amount of commodity to make
   * By default, or when 0 is Infinity
   */
  maxAmount?: number
  /**
   * Minimal amount of any component to make target commodities
   * Default is 0
   */
  minComponentAmount?: number
}

export default class FactoryRoute {
  private options: FactoryRouteOptions

  constructor(options: FactoryRouteOptions) {
    this.options = options
  }

  validateRecipe(
    commodity: CommodityConstant,
    storeFunc: (c: CommodityConstant) => number,
  ) {
    const recipe = COMMODITIES[commodity]
    if (storeFunc(commodity) >= this.maxAmount) {
      return false
    }
    const components = recipe.components
    const componentsList = FactoryRoute.getComponentList(commodity)
    return componentsList.every((comp) =>
      this.validateComponentAmount(components[comp], storeFunc(comp)),
    )
  }

  validateComponentAmount(componentAmount: number, available: number) {
    const required = Math.max(componentAmount, this.minComponentAmount)
    return available >= required
  }

  static getComponentList(commodity: CommodityConstant) {
    const components = COMMODITIES[commodity].components
    return Object.keys(components) as CommodityConstant[]
  }

  get commodities() {
    return this.options.make
  }

  get maxAmount() {
    return this.options.maxAmount || Infinity
  }

  private get minComponentAmount() {
    return this.options.minComponentAmount || 0
  }
}
