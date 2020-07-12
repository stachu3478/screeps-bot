import _ from "lodash"
import sinon from 'sinon'
import boostData from "../mock/boostData";
import { expect } from '../../expect';

describe('Adding a boost request', () => {
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
  });

  describe('no lab entry for resource type', () => {
    describe('null in lab entry array', () => {
      it('should add entry in empty field', function () {
        boosts.resources.labs = [, RESOURCE_UTRIUM_ACID]
        boosts.amounts.labs = [, 500]
        const newBoosts = _.clone(boosts, true)
        newBoosts.resources.labs = [RESOURCE_UTRIUM_ALKALIDE, RESOURCE_UTRIUM_ACID]
        newBoosts.amounts.labs = [10 * LAB_BOOST_MINERAL, 500]
        newBoosts.creeps.push('John')
        newBoosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
        newBoosts.amounts.creeps.push(10 * LAB_BOOST_MINERAL)
        room.createBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE, 10)
        expect(boosts).to.eql(newBoosts)
      });
    })
    describe('array needs to be extended', () => {
      it('should add new entry', function () {
        boosts.resources.labs = [RESOURCE_UTRIUM_ALKALIDE]
        boosts.amounts.labs = [500]
        const newBoosts = _.clone(boosts, true)
        newBoosts.resources.labs = [RESOURCE_UTRIUM_ALKALIDE, RESOURCE_UTRIUM_ACID]
        newBoosts.amounts.labs = [500, 10 * LAB_BOOST_MINERAL]
        newBoosts.creeps.push('John')
        newBoosts.resources.creeps.push(RESOURCE_UTRIUM_ACID)
        newBoosts.amounts.creeps.push(10 * LAB_BOOST_MINERAL)
        room.createBoostRequest('John', RESOURCE_UTRIUM_ACID, 10)
        expect(boosts).to.eql(newBoosts)
      });
    })
  })

  describe('lab entry for resource type exist', () => {
    it('should change the entry properly', function () {
      boosts.resources.labs = [, RESOURCE_UTRIUM_ALKALIDE]
      boosts.amounts.labs = [, 500]
      const newBoosts = _.clone(boosts, true)
      newBoosts.amounts.labs = [, 500 + 10 * LAB_BOOST_MINERAL]
      newBoosts.creeps.push('John')
      newBoosts.resources.creeps.push(RESOURCE_UTRIUM_ALKALIDE)
      newBoosts.amounts.creeps.push(10 * LAB_BOOST_MINERAL)
      room.createBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE, 10)
      expect(boosts).to.eql(newBoosts)
    });
  })
});
