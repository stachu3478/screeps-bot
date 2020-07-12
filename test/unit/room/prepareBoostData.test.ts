import _ from 'lodash'
import sinon from 'sinon'
import { expect } from '../../expect';

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
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    room = {} as Room
    room.prepareBoostData = Room.prototype.prepareBoostData
    boostInfo1 = {} as BoostInfo
    boostInfo2 = {} as BoostInfo
    creepMemory = { role: 123 } as CreepMemory
    sinon.restore()
    boostedMemory = { _targetRole: 123, role: Role.BOOSTER } as CreepMemory
  });

  describe('All boosts rejected', () => {
    beforeEach(() => {
      room.getBestAvailableBoost = () => null
      sinon.spy(room, 'getBestAvailableBoost')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [CARRY], ['capacity'], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.be.calledOnceWithExactly(CARRY, 'capacity', 2)
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 2 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [CARRY, WORK], ['capacity', 'upgradeController'], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.be.calledTwice
      expect(creepMemory).to.eql(oldCreepMemory)
    })
  })

  describe('All boosts accepted', () => {
    beforeEach(() => {
      const boosts = [boostInfo1, boostInfo2]
      room.getBestAvailableBoost = () => boosts.shift() || null
      sinon.spy(room, 'getBestAvailableBoost')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      expect(room.prepareBoostData(creepMemory, [CARRY], ['capacity'], creepBody)).to.eql([boostInfo1])
      expect(room.getBestAvailableBoost).to.be.calledOnce
      expect(creepMemory).to.eql(boostedMemory)
    })

    it('Returns empty array without modifying creep memory 2 request', () => {
      expect(room.prepareBoostData(creepMemory, [CARRY, WORK], ['capacity', 'upgradeController'], creepBody)).to.eql([boostInfo1, boostInfo2])
      expect(room.getBestAvailableBoost).to.be.calledTwice
      expect(creepMemory).to.eql(boostedMemory)
    })
  })

  describe('Some boosts accepted', () => {
    beforeEach(() => {
      const boosts = [null, boostInfo2]
      room.getBestAvailableBoost = () => boosts.shift() || null
      sinon.spy(room, 'getBestAvailableBoost')
    })

    it('Returns empty array without modifying creep memory 0 requests', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [], [], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.not.be.called
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 1 request', () => {
      const oldCreepMemory = _.clone(creepMemory, true)
      expect(room.prepareBoostData(creepMemory, [WORK], ['upgradeController'], creepBody)).to.eql([])
      expect(room.getBestAvailableBoost).to.be.calledOnceWithExactly(WORK, 'upgradeController', 3)
      expect(creepMemory).to.eql(oldCreepMemory)
    })

    it('Returns empty array without modifying creep memory 2 request', () => {
      expect(room.prepareBoostData(creepMemory, [CARRY, WORK], ['capacity', 'upgradeController'], creepBody)).to.eql([boostInfo2])
      expect(room.getBestAvailableBoost).to.be.calledTwice
      expect(creepMemory).to.eql(boostedMemory)
    })
  })
})
