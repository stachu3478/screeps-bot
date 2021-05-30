declare class FactoryRouter {
  findRecipeToProcess(): CommodityConstant | undefined
  findNeededRecipeComponent(): CommodityConstant | undefined
  findNotNeededRecipeComponent(): ResourceConstant | undefined
  isValidRecipe(commodity: CommodityConstant): boolean
}
