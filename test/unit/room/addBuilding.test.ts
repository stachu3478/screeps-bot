import _ from "lodash"
import xyToChar from "planner/pos";
import { expect } from '../../expect';

describe('Adding building to order list', () => {
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

  it("should add char to memory structs empty string", function () {
    const room = new Room('test')
    room.addBuilding(25, 25)
    expect(room.memory.structs).to.eql(expectedChar)
  });

  it("should add char to memory structs on the end of string", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.addBuilding(25, 25)
    expect(room.memory.structs).to.have.lengthOf(7)
    expect(room.memory.structs.slice(0, 6)).to.eql('abcdef')
    expect(room.memory.structs[6]).to.eql(expectedChar)
  });

  it("should insert char at given position", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.addBuilding(25, 25, 3)
    expect(room.memory.structs).to.have.lengthOf(7)
    expect(room.memory.structs.slice(0, 3)).to.eql('abc')
    expect(room.memory.structs.slice(4, 7)).to.eql('def')
    expect(room.memory.structs[3]).to.eql(expectedChar)
  });

  it("should not add char when target position is out of range", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.addBuilding(25, 25, 7)
    expect(room.memory.structs).to.eql('abcdef')
  });

  it("should not add char when it already exists", function () {
    const room = new Room('test')
    room.memory.structs = `abc${expectedChar}def`
    room.addBuilding(25, 25, 7)
    expect(room.memory.structs).to.eql(`abc${expectedChar}def`)
  });
});
