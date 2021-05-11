import _ from 'lodash'
import sinon from 'sinon'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('Preparing array of boosting data', () => {
  let room: Room
  let boostInfo1: BoostInfo
  let boostInfo2: BoostInfo
  let creepMemory: CreepMemory
  let boostedMemory: CreepMemory
  const creepBody = [CARRY, WORK, CARRY, WORK, MOVE, WORK]
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.memory = {}
    room.boosts = new BoostManager(room)
    boostInfo1 = {} as BoostInfo
    boostInfo2 = {} as BoostInfo
    creepMemory = { role: 123 } as CreepMemory
    sinon.restore()
    boostedMemory = { _targetRole: 123, role: Role.BOOSTER } as CreepMemory
  })

  describe('All boosts rejected', () => {
    beforeEach(() => {
      room.boosts.getBestAvailable = () => null
      sinon.spy(room.boosts, 'getBestAvailable')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.boosts.prepareData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.boosts.getBestAvailable).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(
        room.boosts.prepareData(creepMemory, [CARRY], ['capacity'], creepBody),
      ).to.eql([])
      expect(room.boosts.getBestAvailable).to.be.calledOnceWithExactly(
        CARRY,
        'capacity',
        2,
      )
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 2 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(
        room.boosts.prepareData(
          creepMemory,
          [CARRY, WORK],
          ['capacity', 'upgradeController'],
          creepBody,
        ),
      ).to.eql([])
      expect(room.boosts.getBestAvailable).to.be.calledTwice
      expect(creepMemory).to.eql(oldCreepMemory)
    })
  })

  describe('All boosts accepted', () => {
    beforeEach(() => {
      const boosts = [boostInfo1, boostInfo2]
      room.boosts.getBestAvailable = () => boosts.shift() || null
      sinon.spy(room.boosts, 'getBestAvailable')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.boosts.prepareData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.boosts.getBestAvailable).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      expect(
        room.boosts.prepareData(creepMemory, [CARRY], ['capacity'], creepBody),
      ).to.eql([boostInfo1])
      expect(room.boosts.getBestAvailable).to.be.calledOnce
      expect(creepMemory).to.eql(boostedMemory)
    })

    it('Returns empty array without modifying creep memory 2 request', () => {
      expect(
        room.boosts.prepareData(
          creepMemory,
          [CARRY, WORK],
          ['capacity', 'upgradeController'],
          creepBody,
        ),
      ).to.eql([boostInfo1, boostInfo2])
      expect(room.boosts.getBestAvailable).to.be.calledTwice
      expect(creepMemory).to.eql(boostedMemory)
    })
  })

  describe('Some boosts accepted', () => {
    beforeEach(() => {
      const boosts = [null, boostInfo2]
      room.boosts.getBestAvailable = () => boosts.shift() || null
      sinon.spy(room.boosts, 'getBestAvailable')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.boosts.prepareData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.boosts.getBestAvailable).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(
        room.boosts.prepareData(
          creepMemory,
          [WORK],
          ['upgradeController'],
          creepBody,
        ),
      ).to.eql([])
      expect(room.boosts.getBestAvailable).to.be.calledOnceWithExactly(
        WORK,
        'upgradeController',
        3,
      )
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 2 request', () => {
      expect(
        room.boosts.prepareData(
          creepMemory,
          [CARRY, WORK],
          ['capacity', 'upgradeController'],
          creepBody,
        ),
      ).to.eql([boostInfo2])
      expect(room.boosts.getBestAvailable).to.be.calledTwice
      expect(creepMemory).to.eql(boostedMemory)
    })
  })
})
