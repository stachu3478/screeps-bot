import "../constants"
import { expect } from "chai";
import sinon from 'sinon'
import _ from "lodash"
import place from "../../../src/planner/place"
import { Memory } from "../mock"
import Game from "../mock/Game"
import RoomPosition from "../mock/RoomPosition"
import { NOTHING_TODO, SUCCESS } from "constants/response";

describe("planner/place", () => {
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

  it("should return NOTHING_TODO number when called with no context", function () {
    const room = {} as Room
    expect(place(room)).to.eql(NOTHING_TODO);
  });

  it("should place structure", function () {
    const room = {
      memory: { structs: '1' },
      controller: { level: 8 },
    } as Room
    room.createConstructionSite = sinon.fake.returns(OK)
    expect(place(room)).to.eql(SUCCESS);
    expect(room.createConstructionSite).to.be.called
  });

  it("should mark links as placed", function () {
    const room = {
      memory: { structs: '1', links: 'a', controllerLink: 'b' },
      controller: { level: 8 },
    } as Room
    room.createConstructionSite = sinon.fake.returns(ERR_INVALID_TARGET)
    room.find = sinon.fake.returns([])
    const look = sandbox.stub(RoomPosition.prototype, 'lookFor').callsFake(sinon.fake.returns([{ structureType: STRUCTURE_LINK }]))
    expect(place(room)).to.eql(NOTHING_TODO);
    expect(look).to.be.called
    expect(room.memory._linked).to.eql(1)
  });
});
