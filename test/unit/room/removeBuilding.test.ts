import _ from 'lodash'
import xyToChar from 'planner/pos';
import { expect } from '../../expect';

describe('Removing building from order list', () => {
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
    room.removeBuilding(25, 25)
    expect(room.memory.structs).to.be.empty
  });

  it("should remove char from string", function () {
    const room = new Room('test')
    room.memory.structs = `abc${expectedChar}def`
    room.removeBuilding(25, 25)
    expect(room.memory.structs).to.eql('abcdef')
  });

  it("should not remove char when not inside", function () {
    const room = new Room('test')
    room.memory.structs = 'abcdef'
    room.removeBuilding(25, 25)
    expect(room.memory.structs).to.eql('abcdef')
  });
});
