import '../../constants'
import { expect } from '../../../expect'
import MovePartCapability from 'spawn/body/MovePartCapability'
import BoostManager from 'overloads/room/BoostManager'

describe('spawn/body/MovePartCapability', () => {
  let boosts: BoostManager
  beforeEach(() => {
    boosts = {} as BoostManager
  })

  context('when none boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = () => 0
    })

    it('returns nominal 25', () => {
      const capability = new MovePartCapability(boosts)
      expect(capability.usedParts).to.eql(25)
      expect(capability.remainingParts).to.eql(25)
      expect(capability.boost).to.be.undefined
    })
  })

  context('when all boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = (_, c) => c
    })

    it('returns 10', () => {
      const capability = new MovePartCapability(boosts)
      expect(capability.usedParts).to.eql(10)
      expect(capability.remainingParts).to.eql(40)
      expect(capability.boost).to.eq(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE)
    })
  })

  context('when some boosts available', () => {
    beforeEach(() => {
      boosts.getAvailable = (r, c) => (r === RESOURCE_ZYNTHIUM_ALKALIDE ? c : 0)
    })

    it('returns 13', () => {
      const capability = new MovePartCapability(boosts)
      expect(capability.usedParts).to.eql(13)
      expect(capability.remainingParts).to.eql(37)
      expect(capability.boost).to.eq(RESOURCE_ZYNTHIUM_ALKALIDE)
    })
  })
})
