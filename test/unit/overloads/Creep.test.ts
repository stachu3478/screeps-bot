import '../constants'
import '../../../src/overloads/all'
import sinon from 'sinon'
import { expect, assert } from '../../expect'
import Game from '../mock/Game'

describe('Creep', () => {
  let creep: Creep
  beforeEach(() => {
    creep = new Creep('test' as Id<Creep>)
  })

  describe('#cache', () => {
    it('returns cache', () => {
      expect(creep.cache).to.be.an('Object')
    })
  })

  describe('#motherRoom', () => {
    const roomName = 'hisRoom'
    beforeEach(() => {
      // @ts-ignore : allow adding Game to global
      global.Game = _.clone(Game)
      global.Game.rooms[roomName] = {} as Room
      creep.memory.room = roomName
    })

    it('returns his room', () => {
      expect(creep.motherRoom).to.eql(global.Game.rooms[roomName])
    })
  })

  describe('#workpartCount', () => {
    it('returns cached work part count', () => {
      creep.cache.workpartCount = 51
      expect(creep.workpartCount).to.eq(51)
    })

    it('returns calculated work part count', () => {
      delete creep.cache.workpartCount
      sinon.stub(creep, 'getActiveBodyparts').returns(15)
      expect(creep.workpartCount).to.eq(15)
      expect(creep.getActiveBodyparts).to.be.calledOnceWithExactly(WORK)
    })
  })

  describe('#isRetired', () => {
    beforeEach(() => {
      creep.memory.deprivity = 0
      delete creep.ticksToLive
    })

    it('returns false if can be spawned within creep live', () => {
      creep.ticksToLive = 100
      creep.body = new Array(10)
      expect(creep.isRetired).to.be.false
    })

    it('returns false if it have not been spawned', () => {
      creep.body = new Array(10)
      expect(creep.isRetired).to.be.false
    })

    it('returns true if cannot be spawned when deprivity added', () => {
      creep.ticksToLive = 100
      creep.memory.deprivity = 90
      creep.body = new Array(10)
      expect(creep.isRetired).to.be.true
    })

    it('returns true if cannot be spawned within creep live or strictly', () => {
      creep.ticksToLive = 30
      creep.body = new Array(10)
      expect(creep.isRetired).to.be.true
    })
  })

  describe('#hasActiveBodyPart', () => {
    context('when creep is full of hits', () => {
      beforeEach(() => {
        creep.body = [
          { type: ATTACK, hits: 100 },
          { type: CARRY, hits: 100 },
          { type: MOVE, hits: 100 },
        ]
        creep.hits = 300
      })

      it('returns true for attack', () => {
        expect(creep.hasActiveBodyPart(ATTACK)).to.be.true
      })

      it('returns true for carry', () => {
        expect(creep.hasActiveBodyPart(CARRY)).to.be.true
      })

      it('returns true for move', () => {
        expect(creep.hasActiveBodyPart(MOVE)).to.be.true
      })

      it('returns false for work as it does not have that bodypart', () => {
        expect(creep.hasActiveBodyPart(WORK)).to.be.false
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
      })

      it('returns false for attack', () => {
        expect(creep.hasActiveBodyPart(ATTACK)).to.be.false
      })

      it('returns true for carry', () => {
        expect(creep.hasActiveBodyPart(CARRY)).to.be.true
      })

      it('returns true for move', () => {
        expect(creep.hasActiveBodyPart(MOVE)).to.be.true
      })
    })
  })

  describe('#hasActiveAttackBodyPart', () => {
    it('returns false', () => {
      creep.hasActiveBodyPart = () => false
      expect(creep.hasActiveAttackBodyPart).to.be.false
    })

    it('returns true', () => {
      creep.hasActiveBodyPart = (b: BodyPartConstant) => b === ATTACK
      expect(creep.hasActiveAttackBodyPart).to.be.true
    })

    it('returns true', () => {
      creep.hasActiveBodyPart = (b: BodyPartConstant) => b === RANGED_ATTACK
      expect(creep.hasActiveAttackBodyPart).to.be.true
    })
  })

  describe('#safeDistance where unit can feel safe', () => {
    it('returns 0', () => {
      creep.hasActiveBodyPart = () => false
      expect(creep.safeDistance).to.eq(1)
    })

    it('returns 3', () => {
      creep.hasActiveBodyPart = (b: BodyPartConstant) => b === ATTACK
      expect(creep.safeDistance).to.eq(3)
    })

    it('returns 5', () => {
      creep.hasActiveBodyPart = (b: BodyPartConstant) => b === RANGED_ATTACK
      expect(creep.safeDistance).to.eq(5)
    })
  })

  describe('#isSafeFrom - can creep feel safe from another creep', () => {
    const hostile = { safeDistance: 4 } as Creep

    it('returns false', () => {
      creep.pos.getRangeTo = () => 3
      expect(creep.isSafeFrom(hostile)).to.be.false
    })

    it('returns false', () => {
      creep.pos.getRangeTo = () => 4
      expect(creep.isSafeFrom(hostile)).to.be.false
    })

    it('returns true', () => {
      creep.pos.getRangeTo = () => 5
      expect(creep.isSafeFrom(hostile)).to.be.true
    })
  })

  describe('#safeRangeXY - how far creep should run away', () => {
    beforeEach(() => {
      creep.body = [
        { type: RANGED_ATTACK, hits: 100 },
        { type: CARRY, hits: 100 },
        { type: MOVE, hits: 100 },
      ]
      creep.hits = 300
      delete creep.cache._bodypartHitThreshold
      assert.equal(creep.safeDistance, 5)
    })

    it('returns -1', () => {
      sinon.stub(creep.pos, 'rangeXY').returns(4)
      expect(creep.safeRangeXY(12, 45)).to.eq(-1)
      expect(creep.pos.rangeXY).to.be.calledOnceWithExactly(12, 45)
    })

    it('returns 0', () => {
      sinon.stub(creep.pos, 'rangeXY').returns(5)
      expect(creep.safeRangeXY(43, 21)).to.eq(0)
      expect(creep.pos.rangeXY).to.be.calledOnceWithExactly(43, 21)
    })

    it('returns 1', () => {
      sinon.stub(creep.pos, 'rangeXY').returns(6)
      expect(creep.safeRangeXY(12, 45)).to.eq(1)
      expect(creep.pos.rangeXY).to.be.calledOnceWithExactly(12, 45)
    })
  })
})
