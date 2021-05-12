import '../../constants'
import { expect } from '../../../expect'
import MovePartCapability from 'spawn/body/MovePartCapability'
import BoostManager from 'overloads/room/BoostManager'
import BodyDefinition from 'spawn/body/BodyDefinition'

describe('spawn/body/BodyDefinition', () => {
  let boosts: BoostManager
  let movePartCapability: MovePartCapability
  beforeEach(() => {
    boosts = {} as BoostManager
    movePartCapability = {} as MovePartCapability
  })

  context('when none boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = () => 0
      movePartCapability = { usedParts: 25 } as MovePartCapability
    })

    it('has exact 25 MOVE parts', () => {
      const definition = new BodyDefinition(0, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body.filter((p) => p === MOVE)).to.have.lengthOf(25)
    })

    it('has only WORK and MOVE parts', () => {
      const definition = new BodyDefinition(0, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).not.to.include(HEAL)
      expect(definition.body).not.to.include(TOUGH)
      expect(definition.body).to.include(WORK)
      expect(definition.body).to.include(MOVE)
      expect(definition.valid).to.be.true
    })

    it('has not tough parts', () => {
      const definition = new BodyDefinition(500, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).not.to.include(TOUGH)
      expect(definition.valid).to.be.true
    })

    it('has heal parts', () => {
      const definition = new BodyDefinition(500, 100, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).to.include(HEAL)
      expect(definition.valid).to.be.true
    })

    it('is not valid', () => {
      const definition = new BodyDefinition(500, 1000, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body.length).to.be.greaterThan(50)
      expect(definition.valid).to.be.false
    })

    it('does not include boosts', () => {
      const definition = new BodyDefinition(500, 100, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).to.have.lengthOf(50)
      expect(definition.healResource).to.be.undefined
      expect(definition.toughResource).to.be.undefined
      expect(definition.moveResource).to.be.undefined
    })
  })

  context('when all boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = (_, c) => c
      movePartCapability = {
        usedParts: 10,
        boost: 'power',
      } as MovePartCapability
    })

    it('has exact 10 MOVE parts', () => {
      const definition = new BodyDefinition(0, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body.filter((p) => p === MOVE)).to.have.lengthOf(10)
      expect(definition.healResource).to.be.undefined
      expect(definition.toughResource).to.be.undefined
    })

    it('has tough parts', () => {
      const definition = new BodyDefinition(500, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).to.include(TOUGH)
      expect(definition.valid).to.be.true
    })

    it('is not valid', () => {
      const definition = new BodyDefinition(500, 10000, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body.length).to.be.greaterThan(50)
      expect(definition.valid).to.be.false
    })

    it('does include all best boosts', () => {
      const definition = new BodyDefinition(500, 100, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).to.have.lengthOf(50)
      expect(definition.healResource).to.eq(
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
      )
      expect(definition.toughResource).to.eq(
        RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
      )
      expect(definition.moveResource).to.eq('power')
    })
  })

  context('when some boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = (r, c) =>
        r === RESOURCE_LEMERGIUM_ALKALIDE ? c : 0
      movePartCapability = {
        usedParts: 15,
        boost: 'power',
      } as MovePartCapability
    })

    it('has exact 15 MOVE parts', () => {
      const definition = new BodyDefinition(0, 0, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body.filter((p) => p === MOVE)).to.have.lengthOf(15)
    })

    it('does include some boosts', () => {
      const definition = new BodyDefinition(500, 100, boosts, WORK)
      definition.moveParts = movePartCapability
      expect(definition.body).to.have.lengthOf(50)
      expect(definition.healResource).to.eq(RESOURCE_LEMERGIUM_ALKALIDE)
      expect(definition.toughResource).to.be.undefined
      expect(definition.moveResource).to.eq('power')
    })
  })
})
