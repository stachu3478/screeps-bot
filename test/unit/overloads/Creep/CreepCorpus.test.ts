import '../../constants'
import '../../../../src/overloads/all'
import { expect } from '../../../expect'
import CreepCorpus from 'overloads/creep/CreepCorpus'
import { SOURCE_KEEPER_USERNAME } from 'constants/support'

describe('CreepCorpus', () => {
  let creep: Creep
  let corpus: CreepCorpus
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    creep = { name: 'test', owner: { username: 'test' } } as Creep
    Game.getObjectById = () => creep
  })

  describe('#count', () => {
    beforeEach(() => {
      creep.body = [
        { type: WORK, hits: 0 },
        { type: MOVE, hits: 0 },
        { type: WORK, hits: 50 },
        { type: MOVE, hits: 100 },
      ]
      corpus = new CreepCorpus(creep)
    })

    it('returns calculated work part count', () => {
      expect(corpus.count(WORK)).to.eq(2)
    })
  })

  describe('#hasActive', () => {
    context('when creep is full of hits', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 100 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 300
        corpus = new CreepCorpus(creep)
      })

      it('returns true for attack', () => {
        expect(corpus.hasActive(ATTACK)).to.be.true
      })

      it('returns true for carry', () => {
        expect(corpus.hasActive(CARRY)).to.be.true
      })

      it('returns true for move', () => {
        expect(corpus.hasActive(MOVE)).to.be.true
      })

      it('returns false for work as it does not have that bodypart', () => {
        expect(corpus.hasActive(WORK)).to.be.false
      })
    })

    context('when creep has some hits', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 0 },
          { type: CARRY, hits: 1 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 101
        corpus = new CreepCorpus(creep)
      })

      it('returns false for attack', () => {
        expect(corpus.hasActive(ATTACK)).to.be.false
      })

      it('returns true for carry', () => {
        expect(corpus.hasActive(CARRY)).to.be.true
      })

      it('returns true for move', () => {
        expect(corpus.hasActive(MOVE)).to.be.true
      })
    })
  })

  describe('#armed', () => {
    context('when no attack parts', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 0 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 200
        corpus = new CreepCorpus(creep)
      })

      it('returns false', () => {
        expect(corpus.armed).to.be.false
      })
    })

    context('when 1 attack part', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 1 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
        corpus = new CreepCorpus(creep)
      })

      it('returns true', () => {
        expect(corpus.armed).to.be.true
      })
    })

    context('when 1 ranged attack part', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 1 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
        corpus = new CreepCorpus(creep)
      })

      it('returns true', () => {
        expect(corpus.armed).to.be.true
      })
    })
  })

  describe('#safeDistance where unit can feel safe', () => {
    context('when no attack parts', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 0 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 200
        corpus = new CreepCorpus(creep)
      })

      it('returns 1', () => {
        expect(corpus.safeDistance).to.eq(1)
      })
    })

    context('when 1 attack part', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 1 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
        corpus = new CreepCorpus(creep)
      })

      it('returns 3', () => {
        expect(corpus.safeDistance).to.eq(3)
      })
    })

    context('when 1 ranged attack part', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 1 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
        corpus = new CreepCorpus(creep)
      })

      it('returns 5', () => {
        expect(corpus.safeDistance).to.eq(5)
      })
    })

    context('when is source keeper', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 1 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
        corpus = new CreepCorpus(creep)
        creep.owner.username = SOURCE_KEEPER_USERNAME
      })

      it('returns 3', () => {
        expect(corpus.safeDistance).to.eq(3)
      })
    })
  })

  describe('healPower', () => {
    context('not boosted and healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: HEAL, hits: 100 },
          { type: HEAL, hits: 100 },
          { type: HEAL, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 400
      })

      it('returns 36', () => {
        expect(corpus.healPower).to.eq(36)
      })
    })

    context('not boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: HEAL, hits: 0 },
          { type: HEAL, hits: 1 },
          { type: HEAL, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 24', () => {
        expect(corpus.healPower).to.eq(24)
      })
    })

    context('boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: HEAL, hits: 0, boost: 'LHO2' },
          { type: HEAL, hits: 1, boost: 'LO' },
          { type: HEAL, hits: 100, boost: 'XLHO2' },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 72', () => {
        expect(corpus.healPower).to.eq(72)
      })
    })
  })

  describe('rangedHealPower', () => {
    context('boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: HEAL, hits: 0, boost: 'LHO2' },
          { type: HEAL, hits: 1, boost: 'LO' },
          { type: HEAL, hits: 100, boost: 'XLHO2' },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 72 divided by 3 as ranged is 3 times weakier than indirect', () => {
        expect(corpus.rangedHealPower).to.eq(72 / 3)
      })
    })
  })

  describe('#healPowerAt', () => {
    beforeEach(() => {
      creep.body = [
        { type: HEAL, hits: 0, boost: 'LHO2' },
        { type: HEAL, hits: 1, boost: 'LO' },
        { type: HEAL, hits: 100, boost: 'XLHO2' },
        { type: MOVE, hits: 100 },
      ]
      creep.hits = 201
      creep.pos = new RoomPosition(25, 25, 'test')
    })

    context('out of range', () => {
      it('returns 0', () => {
        expect(
          corpus.healPowerAt({ pos: new RoomPosition(26, 29, 'test') }),
        ).to.eq(0)
      })
    })

    context('in long range', () => {
      it('returns 72 divided by 3 as ranged is 3 times weakier than indirect', () => {
        expect(
          corpus.healPowerAt({ pos: new RoomPosition(26, 28, 'test') }),
        ).to.eq(72 / 3)
      })
    })

    context('near', () => {
      it('returns 72', () => {
        expect(
          corpus.healPowerAt({ pos: new RoomPosition(26, 26, 'test') }),
        ).to.eq(72)
      })
    })
  })

  describe('attackPower', () => {
    context('not boosted and healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 400
      })

      it('returns 90', () => {
        expect(corpus.attackPower).to.eq(90)
      })
    })

    context('not boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 0 },
          { type: ATTACK, hits: 1 },
          { type: ATTACK, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 60', () => {
        expect(corpus.attackPower).to.eq(60)
      })
    })

    context('boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 0, boost: 'UH2O' },
          { type: ATTACK, hits: 1, boost: 'UH' },
          { type: ATTACK, hits: 100, boost: 'XUH2O' },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 180', () => {
        expect(corpus.attackPower).to.eq(180)
      })
    })
  })

  describe('rangedAttackPower', () => {
    context('not boosted and healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 100 },
          { type: RANGED_ATTACK, hits: 100 },
          { type: RANGED_ATTACK, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 400
      })

      it('returns 30', () => {
        expect(corpus.rangedAttackPower).to.eq(30)
      })
    })

    context('not boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 0 },
          { type: RANGED_ATTACK, hits: 1 },
          { type: RANGED_ATTACK, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 20', () => {
        expect(corpus.rangedAttackPower).to.eq(20)
      })
    })

    context('boosted and not healed', () => {
      beforeEach(() => {
        creep.body = [
          { type: RANGED_ATTACK, hits: 0, boost: 'KHO2' },
          { type: RANGED_ATTACK, hits: 1, boost: 'KO' },
          { type: RANGED_ATTACK, hits: 100, boost: 'XKHO2' },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 201
      })

      it('returns 60', () => {
        expect(corpus.rangedAttackPower).to.eq(60)
      })
    })
  })

  describe('#attackPowerAt', () => {
    beforeEach(() => {
      creep.body = [
        { type: ATTACK, hits: 0, boost: 'UH2O' },
        { type: ATTACK, hits: 1, boost: 'UH' },
        { type: RANGED_ATTACK, hits: 100, boost: 'XKHO2' },
        { type: MOVE, hits: 100 },
      ]
      creep.hits = 201
      creep.pos = new RoomPosition(25, 25, 'test')
    })

    context('out of range', () => {
      it('returns 0', () => {
        expect(
          corpus.attackPowerAt({ pos: new RoomPosition(26, 29, 'test') }),
        ).to.eq(0)
      })
    })

    context('in long range', () => {
      it('returns 40', () => {
        expect(
          corpus.attackPowerAt({ pos: new RoomPosition(26, 28, 'test') }),
        ).to.eq(40)
      })
    })

    context('near', () => {
      it('returns 100', () => {
        expect(
          corpus.attackPowerAt({ pos: new RoomPosition(26, 26, 'test') }),
        ).to.eq(100)
      })
    })
  })

  describe('#damageDealt Calculating creep damage summary at current body', () => {
    beforeEach(() => {
      creep.body = [
        {
          type: MOVE,
          hits: 100,
        },
        {
          type: CARRY,
          hits: 100,
        },
      ]
    })

    describe('when no damage is dealt', () => {
      it('returns 0', () => {
        expect(corpus.damageDealt(0)).to.eql(0)
      })
    })

    describe('when damage is dealt', () => {
      describe('when parts are damage resistant', () => {
        beforeEach(() => {
          creep.body.unshift({
            type: TOUGH,
            hits: 100,
            boost: RESOURCE_GHODIUM_OXIDE,
          })
        })

        it('returns less dealt damage', () => {
          expect(corpus.damageDealt(100)).to.eql(100 * BOOSTS.tough.GO.damage)
        })

        it('returns more dealt damage', () => {
          const boostMul = BOOSTS.tough.GO.damage
          expect(corpus.damageDealt(200)).to.eql(300 - 100 / boostMul)
        })
      })

      it('returns dealt damage', () => {
        expect(corpus.damageDealt(1)).to.eql(1)
      })
    })

    describe('when more damage is dealt', () => {
      it('returns the same value', () => {
        expect(corpus.damageDealt(144)).to.eql(144)
      })
    })
  })
})
