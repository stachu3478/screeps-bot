import BodyDefinition from './BodyDefinition'

export default class BoostingRequester {
  private boosts: BoostManager
  private def: BodyDefinition

  constructor(boosts: BoostManager, def: BodyDefinition) {
    this.boosts = boosts
    this.def = def
  }

  requestFor(creepName: string, polyAction: string, mandatory: boolean) {
    const boosts = this.boosts
    const def = this.def
    if (def.toughResource)
      boosts.createRequest(
        creepName,
        def.toughResource,
        def.toughCount,
        mandatory,
      )
    if (def.healResource)
      boosts.createRequest(
        creepName,
        def.healResource,
        def.healCount,
        mandatory,
      )
    if (def.moveResource)
      boosts.createRequest(
        creepName,
        def.moveResource,
        def.moveCount,
        mandatory,
      )
    const polyType = def.polyBodyType
    if (polyType) {
      const boost = boosts.getBestAvailable(polyType, polyAction, def.polyCount)
      if (!boost) return
      boosts.createRequest(
        creepName,
        boost.resource,
        boost.partCount,
        mandatory,
      )
    }
  }
}
