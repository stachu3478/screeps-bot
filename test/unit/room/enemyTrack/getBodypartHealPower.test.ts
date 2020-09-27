import { getBodypartHealPower } from 'room/enemyTrack'
import { expect } from '../../../expect'

describe('Calculating heal power of single part', () => {
  it('should return 0 - not a heal part', () => {
    expect(getBodypartHealPower({ type: 'move', hits: 100 })).to.eql(0)
  })

  it('should return 0 - not a healthy part', () => {
    expect(getBodypartHealPower({ type: 'heal', hits: 0 })).to.eql(0)
  })

  it('should return heal part power', () => {
    expect(getBodypartHealPower({ type: 'heal', hits: 1 })).to.eql(HEAL_POWER)
  })

  it('should return heal power multiplied by boost power', () => {
    expect(getBodypartHealPower({ type: 'heal', hits: 1, boost: 'LO' })).to.eql(
      HEAL_POWER * BOOSTS.heal.LO.heal,
    )
  })
})
