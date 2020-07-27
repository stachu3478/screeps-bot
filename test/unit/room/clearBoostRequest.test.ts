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
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data do not have that resource', () => {
    it('should do nothing', function () {
      Game.creeps = {}
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 300])
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data exists', () => {
    it('should remove all and nullify amount', function () {
      Game.creeps = {}
      boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 0]
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should not remove if mandatory', function () {
      Game.creeps = {}
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 1])
      boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      const sameBoosts = _.clone(boosts, true)
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove if mandatory and done', function () {
      Game.creeps = {}
      boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 0]
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 1])
      boosts.labs[0] = [RESOURCE_UTRIUM_ACID, 300]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID, true)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove first lab', function () {
      Game.creeps = {}
      boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 0]
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ALKALIDE, 600, 0])
      boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 600]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove second lab', function () {
      Game.creeps = {}
      boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 600])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 300]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data exists with other', () => {
    it('should remove only creeps', function () {
      Game.creeps = {}
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 200])
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs[0][LabBoostDataKeys.amount] = 500
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('another boost data exists with other unstable', () => {
    it('should remove not existing creeps data', function () {
      Game.creeps = {}
      boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 300, 0])
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 300]
      boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledTwice
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('another boost data exists with other stable', () => {
    it('should not remove existing creeps data', function () {
      Game.creeps = { Johny: { memory: { role: Role.BOOSTER } } as Creep }
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 400])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledOnce
      expect(boosts).to.eql(sameBoosts)
    });

    it('should remove existing creeps data', function () {
      Game.creeps = { Johny: { memory: { role: Role.UPGRADER } } as Creep }
      boosts.labs.push([RESOURCE_UTRIUM_ALKALIDE, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 0])
      const sameBoosts = _.clone(boosts, true)
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ALKALIDE, 400, 0])
      boosts.labs[0] = [RESOURCE_UTRIUM_ALKALIDE, 400]
      boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 400, 0])
      boosts.labs[1] = [RESOURCE_UTRIUM_ACID, 400]
      room.clearBoostRequest('John', RESOURCE_UTRIUM_ACID)
      expect(room.clearBoostRequest).to.be.calledTwice
      expect(boosts).to.eql(sameBoosts)
    });
  })
});
