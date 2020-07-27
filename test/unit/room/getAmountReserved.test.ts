import _ from "lodash"
import { expect } from '../../expect';

describe('Getting amount of mineral reserved for boosting of corresponding type', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should return 0 for missing boost data", function () {
    const room = new Room('test')
    expect(room.getAmountReserved(RESOURCE_UTRIUM_OXIDE)).to.eql(0)
  });

  it("should return 0 for not existing part", function () {
    const room = new Room('test')
    room.memory.boosts = { labs: [[RESOURCE_UTRIUM_OXIDE, 300]], creeps: [] }
    expect(room.getAmountReserved(RESOURCE_UTRIUM_HYDRIDE)).to.eql(0)
  });

  it("should find and return reserved amount", function () {
    const room = new Room('test')
    room.memory.boosts = { labs: [[RESOURCE_UTRIUM_OXIDE, 300], [RESOURCE_UTRIUM_HYDRIDE, 200]], creeps: [] }
    expect(room.getAmountReserved(RESOURCE_UTRIUM_HYDRIDE)).to.eql(200)
  });
});
