import BodyDefinition from './BodyDefinition'

export default class BoostingRequester {
  private boosts: BoostManager
  private def: BodyDefinition
  private creepName: string
  private mandatory: boolean

  constructor(
    boosts: BoostManager,
    def: BodyDefinition,
    creepName: string,
    mandatory = true,
  ) {
    this.boosts = boosts
    this.def = def
    this.creepName = creepName
    this.mandatory = mandatory
  }

  requestFor(polyAction: string) {
    const boosts = this.boosts
    const def = this.def
    this.createFor(def.toughCount, def.toughResource)
    this.createFor(def.healCount, def.healResource)
    this.createFor(def.moveCount, def.moveResource)
    const polyType = def.polyBodyType
    if (polyType) {
      const boost = boosts.getBestAvailable(polyType, polyAction, def.polyCount)
      if (boost) {
        this.createFor(boost.partCount, boost.resource)
      }
    }
  }

  private createFor(amount: number, resource?: ResourceConstant) {
    if (resource) {
      this.boosts.createRequest(
        this.creepName,
        resource,
        amount,
        this.mandatory,
      )
    }
  }
}
