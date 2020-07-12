import _ from "lodash"
import xyToChar from "planner/pos";
import { expect } from '../../expect';

describe('Setting building order in order list', () => {
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
    room.setBuildingOrder(25, 25, 0)
    expect(room.memory.structs).to.be.undefined
  });

  it("should do nothing at out of range", function () {
    const room = new Room('test')
    room.memory.structs = `abc${expectedChar}def`
    room.setBuildingOrder(25, 25, 7)
    expect(room.memory.structs).to.eql(`abc${expectedChar}def`)
  });

  it("should move char to target position at left", function () {
    const room = new Room('test')
    room.memory.structs = `abcde${expectedChar}f`
    room.setBuildingOrder(25, 25, 2)
    expect(room.memory.structs).to.eql(`ab${expectedChar}cdef`)
  });

  it("should move char to target position at right", function () {
    const room = new Room('test')
    room.memory.structs = `ab${expectedChar}cdef`
    room.setBuildingOrder(25, 25, 5)
    expect(room.memory.structs).to.eql(`abcde${expectedChar}f`)
  });

  it("should not move if it is the same position", function () {
    const room = new Room('test')
    room.memory.structs = `ab${expectedChar}cdef`
    room.setBuildingOrder(25, 25, 2)
    expect(room.memory.structs).to.eql(`ab${expectedChar}cdef`)
  });

  it("should do nothing if char not exists", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.setBuildingOrder(25, 25, 2)
    expect(room.memory.structs).to.eql('abcdef')
  });
});
