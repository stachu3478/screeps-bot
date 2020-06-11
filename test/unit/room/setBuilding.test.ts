import { expect } from "chai";
import _ from "lodash"
import xyToChar from "planner/pos";

describe('Replacing building position in order list', () => {
  const expectedChar = String.fromCharCode(xyToChar(25, 25))
  before(() => {
    // runs before all test in this block
  });

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should do nothing at empty string", function () {
    const room = new Room('test')
    room.setBuilding(25, 25, 0)
    expect(room.memory.structs).to.be.empty
  });

  it("should do nothing at out of range", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.setBuilding(25, 25, 6)
    expect(room.memory.structs).to.eql('abcdef')
  });

  it("should replace char", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.setBuilding(25, 25, 3)
    expect(room.memory.structs).to.eql(`abc${expectedChar}ef`)
  });

  it("should not replace char if already exists", function () {
    const room = new Room('test')
    room.memory.structs = `${expectedChar}abcdef`
    room.setBuilding(25, 25, 3)
    expect(room.memory.structs).to.eql(`${expectedChar}abcdef`)
  });
});
