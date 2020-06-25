import { expect } from 'chai';
import { getTowerAttackPower } from 'room/enemyTrack';

describe('Calculating attack power of tower in place', () => {
  let tower: StructureTower
  beforeEach(() => {
    tower = {} as StructureTower
    tower.store = { energy: 120 } as Store<RESOURCE_ENERGY, false>
  })

  describe('when no energy is stored', () => {
    beforeEach(() => {
      tower.store.energy = 0
    })

    it('should return 0', () => {
      expect(getTowerAttackPower(tower, 5)).to.eql(0)
    });
  })

  describe('energy is stored', () => {
    it('should return optimal damage', () => {
      expect(getTowerAttackPower(tower, TOWER_OPTIMAL_RANGE)).to.eql(TOWER_POWER_ATTACK)
    });

    it('should return bit less than optimal damage', () => {
      expect(getTowerAttackPower(tower, TOWER_OPTIMAL_RANGE + 1)).to.approximately(TOWER_POWER_ATTACK, 30)
        .and.lessThan(TOWER_POWER_ATTACK)
    });

    it('should return falloff damage', () => {
      expect(getTowerAttackPower(tower, TOWER_FALLOFF_RANGE)).to.eql(TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF))
    });

    it('should return bit more than falloff damage', () => {
      const faloff = TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)
      expect(getTowerAttackPower(tower, TOWER_FALLOFF_RANGE - 1)).to.approximately(faloff, 30)
        .and.greaterThan(faloff)
    });

    it('should return intermediate value', () => {
      expect(getTowerAttackPower(tower, (TOWER_FALLOFF_RANGE + TOWER_OPTIMAL_RANGE) / 2)).to.eql((TOWER_POWER_ATTACK + TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)) / 2)
    });
  })
});
