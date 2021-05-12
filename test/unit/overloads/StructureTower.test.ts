import '../constants'
import '../../../src/overloads/all'
import { expect } from '../../expect'

describe('StructureTower', () => {
  let tower: StructureTower
  beforeEach(() => {
    tower = new StructureTower('test' as Id<StructureTower>)
    tower.store = { energy: 120 } as Store<RESOURCE_ENERGY, false>
    tower.pos = new RoomPosition(25, 25, 'test')
  })

  describe('#attackPowerAt', () => {
    describe('when no energy is stored', () => {
      beforeEach(() => {
        tower.store.energy = 0
      })

      it('returns 0', () => {
        expect(
          tower.attackPowerAt({ pos: new RoomPosition(26, 29, 'test') }),
        ).to.eql(0)
      })
    })

    describe('energy is stored', () => {
      it('returns optimal damage', () => {
        expect(
          tower.attackPowerAt({ pos: new RoomPosition(26, 29, 'test') }),
        ).to.eql(TOWER_POWER_ATTACK)
      })

      it('returns bit less than optimal damage', () => {
        expect(tower.attackPowerAt({ pos: new RoomPosition(26, 31, 'test') }))
          .to.approximately(TOWER_POWER_ATTACK, 30)
          .and.lessThan(TOWER_POWER_ATTACK)
      })

      it('returns falloff damage', () => {
        expect(
          tower.attackPowerAt({ pos: new RoomPosition(45, 31, 'test') }),
        ).to.eql(TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF))
      })

      it('returns bit more than falloff damage', () => {
        const faloff = TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)
        expect(tower.attackPowerAt({ pos: new RoomPosition(44, 31, 'test') }))
          .to.approximately(faloff, 30)
          .and.greaterThan(faloff)
      })

      it('returns intermediate value', () => {
        expect(
          tower.attackPowerAt({ pos: new RoomPosition(30, 37.5, 'test') }),
        ).to.eql(
          (TOWER_POWER_ATTACK + TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)) / 2,
        )
      })
    })
  })
})
