import _ from 'lodash'
import sinon from 'sinon'
import boostData from '../mock/boostData'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('Removing a boost request', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.memory = {} as RoomMemory
    room.memory.boosts = boostData()
    room.boosts = new BoostManager(room)
    sinon.restore()
    sinon.spy(room.boosts, 'clearRequest')
  })

  describe('empty boost data', () => {
    it('should do nothing', () => {
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data do not have that name', () => {
    it('should do nothing', () => {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data do not have that resource', () => {
    it('should do nothing', () => {
      Game.creeps = {}
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 300])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data exists', () => {
    it('should remove all and nullify amount', () => {
      Game.creeps = {}
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 0]
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('should not remove if mandatory', () => {
      Game.creeps = {}
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 1])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('should remove if mandatory and done', () => {
      Game.creeps = {}
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 0]
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 1])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID, true)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('should remove first lab', () => {
      Game.creeps = {}
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 0]
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 600, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 600]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ALKALIDE)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('should remove second lab', () => {
      Game.creeps = {}
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 600])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data exists with other', () => {
    it('should remove only creeps', () => {
      Game.creeps = {}
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 200])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[0][LabBoostDataKeys.amount] = 500
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('another boost data exists with other unstable', () => {
    it('should remove not existing creeps data', () => {
      Game.creeps = {}
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 300]
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledTwice
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('another boost data exists with other stable', () => {
    it('should not remove existing creeps data', () => {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 400])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledOnce
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('should remove existing creeps data', function () {
      Game.creeps = { Johny: { memory: { role: Role.UPGRADER } } as Creep }
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 400]
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.boosts.clearRequest).to.be.calledTwice
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })
})
