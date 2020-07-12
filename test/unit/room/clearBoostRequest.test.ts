import _ from "lodash"
import sinon from 'sinon'
import boostData from "../mock/boostData";
import { expect } from '../../expect';

describe('Removing a boost request', () => {
  let room: Room
  let boosts: BoostData
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    room = new Room('test')
    boosts = boostData()
    room.getBoosts = () => boosts
    sinon.restore()
    sinon.spy(room, 'clearBoostRequest')
  });

  describe('empty boost data', () => {
    it('should do nothing', function () {
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data do not have that name', () => {
    it('should do nothing', function () {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      boosts.creeps.push('Johny')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      boosts.amounts.labs.push(300)
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data do not have that resource', () => {
    it('should do nothing', function () {
      Game.creeps = {}
      boosts.creeps.push('John')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.creeps.push(300)
      boosts.amounts.labs.push(300)
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data exists', () => {
    it('should remove all', function () {
      Game.creeps = {}
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('John')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      boosts.amounts.labs.push(300)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove first lab', function () {
      Game.creeps = {}
      boosts.resources.labs[1] = RESOURCE_UTRIUM_ACID
      boosts.amounts.labs[1] = 300
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('John')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.resources.labs[0] = RESOURCE_UTRIUM_ALKALIDE
      boosts.amounts.creeps.push(600)
      boosts.amounts.labs[0] = 600
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove second lab', function () {
      Game.creeps = {}
      boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.labs.push(600)
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('John')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      boosts.amounts.labs.push(300)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data exists with other', () => {
    it('should remove only creeps', function () {
      Game.creeps = {}
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.labs.push(200)
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('John')
      boosts.amounts.labs[0] = 500
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('another boost data exists with other unstable', () => {
    it('should remove not existing creeps data', function () {
      Game.creeps = {}
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('Johny')
      boosts.creeps.push('John')
      boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.labs.push(300)
      boosts.amounts.labs.push(400)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      boosts.amounts.creeps.push(400)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledTwice
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('another boost data exists with other stable', () => {
    it('should not remove existing creeps data', function () {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      boosts.creeps.push('Johny')
      boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.labs.push(400)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.creeps.push(400)
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('John')
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.labs.push(400)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(400)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove existing creeps data', function () {
      Game.creeps = { Johny: { memory: { role: Role.UPGRADER } } as Creep }
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push('Johny')
      boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.labs.push(400)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      boosts.amounts.creeps.push(400)
      boosts.creeps.push('John')
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.labs.push(400)
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(400)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledTwice
      expect(boosts).to.eql(sameBoosts)
    });
  })
});
