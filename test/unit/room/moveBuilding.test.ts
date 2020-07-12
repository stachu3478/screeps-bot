import _ from "lodash"
import xyToChar from "planner/pos";
import { expect } from '../../expect';

describe('Moving building from order list', () => {
  const expectedChar1 = String.fromCharCode(xyToChar(25, 25))
  const expectedChar2 = String.fromCharCode(xyToChar(15, 15))
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
    room.moveBuilding(25, 25, 15, 15)
    expect(room.memory.structs).to.be.empty
  });

  it("should change char in string", function () {
    const room = new Room('test')
    room.memory.structs = `abc${expectedChar1}def`
    room.moveBuilding(25, 25, 15, 15)
    expect(room.memory.structs).to.eql(`abc${expectedChar2}def`)
  });

  it("should not change char when not inside", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.moveBuilding(25, 25, 15, 15)
    expect(room.memory.structs).to.eql('abcdef')
  });

  it("should not change char if target position is occupied", function () {
    const room = new Room('test')
    room.memory.structs = `${expectedChar2}abc${expectedChar1}def`
    room.moveBuilding(25, 25, 15, 15)
    expect(room.memory.structs).to.eql(`${expectedChar2}abc${expectedChar1}def`)
  });
});
