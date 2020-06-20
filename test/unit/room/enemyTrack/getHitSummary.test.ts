import { expect } from 'chai';
import { getHitSummary } from 'room/enemyTrack';

describe('Calculating creep damage/heal summary at current body', () => {
  let body: Creep['body']
  beforeEach(() => {
    body = [] as Creep['body']
    body.push({
      type: MOVE,
      hits: 100
    })
  })

  describe('when no damage is dealt', () => {
    describe('when is not healed', () => {
      it('should return 0', () => {
        expect(getHitSummary(body, 0, 0)).to.eql(0)
      });
    })

    describe('when is healed', () => {
      it('should return - healed amount', () => {
        expect(getHitSummary(body, 0, 100)).to.eql(-100)
      });
    })
  })

  describe('when damage is dealt', () => {
    describe('when parts are damage resistant', () => {
      beforeEach(() => {
        body.unshift({
          type: TOUGH,
          hits: 100,
          boost: RESOURCE_GHODIUM_OXIDE
        })
      })

      it('should return less dealt damage', () => {
        expect(getHitSummary(body, 100, 0)).to.eql(100 * BOOSTS.tough.GO.damage)
      });

      it('should return more dealt damage', () => {
        const boostMul = BOOSTS.tough.GO.damage
        expect(getHitSummary(body, 200, 0)).to.eql(300 - 100 / boostMul)
      });
    })

    describe('when is not healed', () => {
      it('should return dealt damage', () => {
        expect(getHitSummary(body, 100, 0)).to.eql(100)
      });
    })

    describe('when is healed', () => {
      it('should return difference', () => {
        expect(getHitSummary(body, 150, 100)).to.eql(50)
      });
    })
  })

  describe('when more damage is dealt', () => {
    it('should return the same value', () => {
      expect(getHitSummary(body, 1500, 0)).to.eql(1500)
    });
  })
});
