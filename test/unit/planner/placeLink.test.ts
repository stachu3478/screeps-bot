import "../constants"
import { expect } from "chai";
import sinon from 'sinon'
import _ from "lodash"
import placeLink from "../../../src/planner/place/link"
import { Memory } from "../mock"
import Game from "../mock/Game"
import RoomPosition from "../mock/RoomPosition"

describe("planner/place/link", () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    // @ts-ignore : allow adding Memory to global
    global.RoomPosition = RoomPosition
  });

  afterEach(() => {
    sinon.reset()
    sandbox.restore()
  });

  it("should return false when called with no context", function () {
    const room = {} as Room
    expect(placeLink(room, {})).to.eql(false);
  });

  it("should mark links as placed", function () {
    const room = {
      memory: { links: 'a', controllerLink: 'b' },
      controller: { level: 8 },
    } as Room
    room.createConstructionSite = sinon.fake.returns(ERR_INVALID_TARGET)
    room.find = sinon.fake.returns([])
    room.lookForAt = sinon.fake((type: LookConstant) => type === LOOK_STRUCTURES ? [{ structureType: STRUCTURE_LINK }] : [])
    expect(placeLink(room, room.memory)).to.eql(false);
    expect(room.lookForAt).to.be.called
    expect(room.memory._linked).to.eql(1)
  });
});