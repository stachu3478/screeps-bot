import { expect } from "chai";
import _ from "lodash"
import sinon from 'sinon'
import boostData from "../mock/boostData";

describe('Getting a boost request', () => {
  let room: Room
  let boosts: BoostData
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    room = {} as Room
    room.getBoostRequest = Room.prototype.getBoostRequest
    room.clearBoostRequest = sinon.spy(Room.prototype.clearBoostRequest)
    boosts = boostData()
    room.getBoosts = () => boosts
    lab = { id: 'lab', mineralType: RESOURCE_UTRIUM_ACID } as StructureLab
    room.externalLabs = [lab]
    sinon.restore()
  });

  describe('empty boost data', () => {
    it('should return null', function () {
      room.getBoostRequest('John')
      expect(room.getBoostRequest('John')).to.be.undefined
    });
  })

  describe('no creep matching', () => {
    it('should return null and call no action', function () {
      boosts.creeps.push('Johny')
      boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
      boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
      boosts.amounts.creeps.push(300)
      boosts.amounts.labs.push(300)
      const sameBoosts = _.clone(boosts, true)
      room.getBoostRequest('John')
      expect(room.getBoostRequest('John')).to.be.undefined
      expect(room.clearBoostRequest).to.not.be.called
      expect(boosts).to.eql(sameBoosts)
    });
  })

  describe('boost data exist', () => {
    describe('labs not exist', () => {
      beforeEach(() => {
        room.externalLabs = []
      })

      it('should not return boost data', function () {
        boosts.creeps.push('John')
        boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
        boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
        boosts.amounts.creeps.push(300)
        boosts.amounts.labs.push(300)
        room.getBoostRequest('John')
        expect(room.getBoostRequest('John')).to.be.undefined
      });
    })

    describe('no lab with that mineral type', () => {
      beforeEach(() => {
        delete room.externalLabs[0].mineralType
      })

      it('should not return boost data', function () {
        boosts.creeps.push('John')
        boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
        boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
        boosts.amounts.creeps.push(300)
        boosts.amounts.labs.push(300)
        room.getBoostRequest('John')
        expect(room.clearBoostRequest).to.be.calledOnce
        expect(room.getBoostRequest('John')).to.be.undefined
      });

      it('should return null and call delete for all for missing resources', function () {
        const sameBoosts = _.clone(boosts, true)
        boosts.creeps.push('John', 'John')
        boosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
        boosts.resources.creeps.push(RESOURCE_CATALYZED_GHODIUM_ACID)
        boosts.resources.labs.push(RESOURCE_UTRIUM_ALKALIDE)
        boosts.resources.labs.push(RESOURCE_CATALYZED_GHODIUM_ACID)
        boosts.amounts.creeps.push(300)
        boosts.amounts.creeps.push(600)
        boosts.amounts.labs.push(300)
        boosts.amounts.labs.push(600)
        room.getBoostRequest('John')
        expect(room.clearBoostRequest).to.be.calledTwice
        expect(room.getBoostRequest('John')).to.be.undefined
        expect(boosts).to.eql(sameBoosts)
      });
    })

    describe('exact lab exists', () => {
      it('should return boost data', function () {
        boosts.creeps.push('John')
        boosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
        boosts.resources.labs.push(RESOURCE_UTRIUM_ACID)
        boosts.amounts.creeps.push(300)
        boosts.amounts.labs.push(300)
        room.getBoostRequest('John')
        expect(room.getBoostRequest('John')).to.eql('lab')
      });
    })
  })
});
