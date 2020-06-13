import { expect } from "chai";
import _ from "lodash"
import sinon from 'sinon'
import boostData from "../mock/boostData";

describe('Getting best option for boosting action', () => {
  let room: Room
  let boosts: BoostData
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    boosts = boostData()
    room = { getBoosts: () => boosts } as Room
    room.getBestAvailableBoost = Room.prototype.getBestAvailableBoost
    room.getAvailableBoosts = Room.prototype.getAvailableBoosts
    room.getAmountReserved = Room.prototype.getAmountReserved

    room.getBoosts = () => boosts
    room.terminal = { store: { [RESOURCE_GHODIUM_HYDRIDE]: 300, [RESOURCE_GHODIUM_ACID]: 0, [RESOURCE_CATALYZED_GHODIUM_ACID]: 0 } } as StructureTerminal
    room.externalLabs = [lab]
    sinon.restore()
  });

  describe('no terminal', () => {
    it('should return null', function () {
      delete room.terminal
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql(null)
    });
  })

  describe('no external labs', () => {
    it('should return null', function () {
      room.externalLabs = []
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql(null)
    });
  })

  describe('no resource in terminal', () => {
    it('should return null', function () {
      room.terminal = room.terminal || {} as StructureTerminal
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 0
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql(null)
    });
  })

  describe('only weakiest resource in terminal', () => {
    it('should return the weakiest resource', function () {
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql({
        resource: RESOURCE_GHODIUM_HYDRIDE,
        partCount: 300 / LAB_BOOST_MINERAL
      })
    });
  })

  describe('more resources in terminal', () => {
    it('should return the better resource', function () {
      room.terminal = room.terminal || {} as StructureTerminal
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql({
        resource: RESOURCE_GHODIUM_ACID,
        partCount: 300 / LAB_BOOST_MINERAL
      })
    });
  })

  describe('more amounts not needed', () => {
    it('should respect better resource', function () {
      room.terminal = room.terminal || {} as StructureTerminal
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 3000
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(room.getBestAvailableBoost('work', 'upgradeController', 10)).to.eql({
        resource: RESOURCE_GHODIUM_ACID,
        partCount: 300 / LAB_BOOST_MINERAL
      })
    });
  })

  describe('more amounts needed', () => {
    it('should respect better amount', function () {
      room.terminal = room.terminal || {} as StructureTerminal
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 3000
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(room.getBestAvailableBoost('work', 'upgradeController', 100)).to.eql({
        resource: RESOURCE_GHODIUM_HYDRIDE,
        partCount: 3000 / LAB_BOOST_MINERAL
      })
    });
  })
});
