import '../constants'
import '../../../src/overloads/all'
import sinon from 'sinon'
import { expect, assert } from '../../expect'
import Game from '../mock/Game'
import CreepCorpus from 'overloads/creep/CreepCorpus'

describe('Creep', () => {
  let creep: Creep
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    creep = new Creep('test' as Id<Creep>)
    Game.getObjectById = () => creep
  })

  describe('#cache', () => {
    it('returns cache', () => {
      expect(creep.cache).to.be.an('Object')
    })
  })

  describe('#motherRoom', () => {
    const roomName = 'hisRoom'
    beforeEach(() => {
      global.Game.rooms[roomName] = {} as Room
      creep.memory.room = roomName
    })

    it('returns his room', () => {
      expect(creep.motherRoom).to.eql(global.Game.rooms[roomName])
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

  describe('#isSafeFrom - can creep feel safe from another creep', () => {
    let hostile: Creep
    beforeEach(() => {
      hostile = {} as Creep
      hostile.corpus = {} as CreepCorpus
      hostile.corpus.safeDistance = 4
    })

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
      assert.equal(creep.corpus.safeDistance, 5)
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
