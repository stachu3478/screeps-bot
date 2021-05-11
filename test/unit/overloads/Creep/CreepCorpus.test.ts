import '../../constants'
import '../../../../src/overloads/all'
import { expect } from '../../../expect'
import CreepCorpus from 'overloads/creep/CreepCorpus'

describe('CreepCorpus', () => {
  let creep: Creep
  let corpus: CreepCorpus
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    creep = { name: 'test' } as Creep
    Game.creeps[creep.name] = creep
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
        creep.hits = 300
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
        creep.hits = 300
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
        creep.hits = 300
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
        creep.hits = 300
      })

      it('returns 72 divided by 3 as ranged is 3 times weakier than indirect', () => {
        expect(corpus.rangedHealPower).to.eq(72 / 3)
      })
    })
  })
})
