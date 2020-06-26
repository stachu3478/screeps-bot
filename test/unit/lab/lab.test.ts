import { expect } from "chai";
import _ from "lodash"
import lab from "role/lab";

describe('Lab system initialization', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    room = {} as Room
    room.lab1 = {} as StructureLab
    room.visual = new RoomVisual()
  });

  it("should do nothing if system is cooling down", function () {
    room.memory = { labCooldown: 1 }
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.be.undefined
  });

  it("should do nothing if main labs are missing", function () {
    room.memory = { labCooldown: 0 }
    lab(room)
    expect(room.memory.labState).to.be.undefined
  });

  it("should return to IDLE state if no more data are present", function () {
    room.memory = { labCooldown: 0 }
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.eql(State.IDLE)
  });

  it("should return to LAB_PRODUCING state if recipe is present", function () {
    room.memory = { labCooldown: 0, labRecipe: RESOURCE_UTRIUM_HYDRIDE }
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.eql(State.LAB_PRODUCING)
  });
});
