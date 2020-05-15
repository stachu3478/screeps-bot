import "../constants"
import { assert } from "chai";
import _ from "lodash"
import harvest from "../../../src/routine/work/harvest"
import { Memory, Creep } from "../mock"
import Game from "../mock/Game"

describe("routine/harvest", () => {
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

  it("should export a loop function", function () {
    assert.isTrue(typeof harvest === "function");
  });

  it("should return number when called with no context", function () {
    assert.isNumber(harvest(_.clone(Creep) as Creep));
  });
});
