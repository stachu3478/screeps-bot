import _ from "lodash"
import sinon from 'sinon'
import boostData from "../mock/boostData";
import { expect } from '../../expect';

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
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
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
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        room.getBoostRequest('John')
        expect(room.getBoostRequest('John')).to.be.undefined
      });
    })

    describe('no lab with that mineral type', () => {
      beforeEach(() => {
        delete room.externalLabs[0].mineralType
      })

      it('should not return boost data', function () {
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        room.getBoostRequest('John')
        expect(room.clearBoostRequest).to.be.calledOnce
        expect(room.getBoostRequest('John')).to.be.undefined
      });

      it('should return null and call delete for all for missing resources', function () {
        boosts.labs.push(
          [RESOURCE_UTRIUM_ALKALIDE, 0],
          [RESOURCE_CATALYZED_GHODIUM_ACID, 0]
        )
        const sameBoosts = _.clone(boosts, true)
        boosts.creeps.push(
          ['John', RESOURCE_UTRIUM_ALKALIDE, 300, 0],
          ['John', RESOURCE_CATALYZED_GHODIUM_ACID, 600, 0]
        )
        boosts.labs = [
          [RESOURCE_UTRIUM_ALKALIDE, 300],
          [RESOURCE_CATALYZED_GHODIUM_ACID, 600]
        ]
        room.getBoostRequest('John')
        expect(room.clearBoostRequest).to.be.calledTwice
        expect(room.getBoostRequest('John')).to.be.undefined
        expect(boosts).to.eql(sameBoosts)
      });
    })

    describe('exact lab exists', () => {
      it('should return boost data', function () {
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        room.getBoostRequest('John')
        expect(room.getBoostRequest('John')).to.eql('lab')
      });
    })
  })
});
