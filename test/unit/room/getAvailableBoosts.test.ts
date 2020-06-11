import { expect } from "chai";
import _ from "lodash"

describe('Getting amount of parts that can be boosted with corresponding mineral type', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should return 0 for missing terminal", function () {
    const room = new Room('test')
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
  });

  it("should return 0 for empty storage and reservations", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: 0 } } as StructureTerminal
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
  });

  it("should return 10 for available all parts", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: 300 } } as StructureTerminal
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
  });

  it("should return 10 for more available", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: Infinity } } as StructureTerminal
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
  });

  it("should return less for not all parts", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: 150 } } as StructureTerminal
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(5)
  });

  it("should return 0 for all parts reserved", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: 300 } } as StructureTerminal
    room.memory.boosts = {
      resources: { labs: [RESOURCE_UTRIUM_OXIDE] },
      amounts: { labs: [300] }
    } as BoostData
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
  });

  it("should return partial amounts", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: 450 } } as StructureTerminal
    room.memory.boosts = {
      resources: { labs: [RESOURCE_UTRIUM_OXIDE] },
      amounts: { labs: [300] }
    } as BoostData
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(5)
  });

  it("should ignore reservation", function () {
    const room = new Room('test')
    room.terminal = { store: { [RESOURCE_UTRIUM_OXIDE]: Infinity } } as StructureTerminal
    room.memory.boosts = {
      resources: { labs: [RESOURCE_UTRIUM_OXIDE] },
      amounts: { labs: [300] }
    } as BoostData
    expect(room.getAvailableBoosts(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
  });
});
