import factoryRoutes from 'config/routes/factory'
import { factoryStoragePerResource } from 'utils/handleFactory'
import Memoized from 'utils/Memoized'
import FactoryRoute from './FactoryRoute'

export default class FactoryRouter {
  private factoryMemo: Memoized<StructureFactory>

  constructor(factory: StructureFactory) {
    this.factoryMemo = new Memoized(factory)
  }

  findRecipeToProcess() {
    let commodity: CommodityConstant | undefined
    factoryRoutes.some((r) => {
      return (commodity = r.commodities.find((c) => {
        if (!this.validateRecipe(r, c)) {
          return false
        }
        return this.canBeProduced(c)
      }))
    })
    return commodity
  }

  findNeededRecipeComponent() {
    let commodity: CommodityConstant | undefined
    factoryRoutes.some((r) => {
      return r.commodities.some((c) => {
        if (!this.validateRecipe(r, c)) {
          return false
        }
        const componentsList = FactoryRoute.getComponentList(c)
        return (commodity = componentsList.find(
          (comp) => this.factory.store[comp] < factoryStoragePerResource,
        ))
      })
    })
    return commodity
  }

  findNotNeededRecipeComponent(): ResourceConstant | undefined {
    for (const n in this.factory.store) {
      const name = n as ResourceConstant
      const notNeeded = factoryRoutes.every((r) => {
        return r.commodities.every((c) => {
          const componentsList = FactoryRoute.getComponentList(c)
          const notInRecipe = componentsList.every((comp) => comp !== name)
          if (notInRecipe) {
            return true
          }
          return !this.validateRecipe(r, c)
        })
      })
      if (notNeeded) {
        return name
      }
    }
    return undefined
  }

  isValidRecipe(commodity: CommodityConstant) {
    return factoryRoutes.some((r) => {
      const hasRecipe = r.commodities.indexOf(commodity) !== -1
      if (!hasRecipe) {
        return false
      }
      return this.validateRecipe(r, commodity)
    })
  }

  private validateRecipe(route: FactoryRoute, commodity: CommodityConstant) {
    const recipe = COMMODITIES[commodity]
    if (recipe.level && recipe.level !== this.factory.level) {
      return false
    }
    return route.validateRecipe(commodity, (c: CommodityConstant) =>
      this.room.totalStore(c),
    )
  }

  private canBeProduced(commodity: CommodityConstant) {
    const factory = this.factory
    const components = COMMODITIES[commodity].components
    const componentsList = FactoryRoute.getComponentList(commodity)
    const producable = componentsList.every(
      (comp) => factory.store[comp] >= components[comp],
    )
    console.log(commodity, 'produc?', producable)
    return producable
  }

  private get room() {
    return this.factory.room
  }

  private get factory() {
    return this.factoryMemo.permitted
  }
}
