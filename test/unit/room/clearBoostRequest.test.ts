import _ from 'lodash'
import sinon from 'sinon'
import boostData from '../mock/boostData'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('Removing a boost request', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    room = {} as Room
    room.memory = {}
    room.memory.boosts = boostData()
    room.boosts = new BoostManager(room)
    sinon.restore()
  })

  describe('empty boost data', () => {
    it('does nothing', () => {
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data do not have that name', () => {
    it('does nothing', () => {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data do not have that resource', () => {
    it('does nothing', () => {
      Game.creeps = { John: { memory: { role: Role.BOOSTER } } as Creep }
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 300])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data exists', () => {
    it('removes all', () => {
      Game.creeps = {}
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('removes if mandatory and done', () => {
      Game.creeps = {}
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 1])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID, true)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('removes first lab', () => {
      Game.creeps = {}
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 0]
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 600, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 600]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ALKALIDE)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('removes second lab', () => {
      Game.creeps = {}
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 600])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data exists with other', () => {
    it('removes only creeps', () => {
      Game.creeps = {}
      room.boosts.labs.push([RESOURCE_UTRIUM_ACID, 200])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      room.boosts.labs[0][LabBoostDataKeys.amount] = 500
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('another boost data exists with other unstable', () => {
    it('removes not existing creeps data', () => {
      Game.creeps = {}
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 300]
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })

  describe('another boost data exists with other stable', () => {
    it('does not remove existing creeps data', () => {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      room.boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 400])
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })

    it('removes existing creeps data', () => {
      Game.creeps = { Johny: { memory: { role: Role.UPGRADER } } as Creep }
      const sameBoosts = _.clone(room.memory.boosts, true)
      room.boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      room.boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 400]
      room.boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      room.boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.boosts.clearRequests('John', RESOURCE_UTRIUM_ACID)
      expect(room.memory.boosts).to.eql(sameBoosts)
    })
  })
})
