import "../../constants"
import { assert } from "chai";
import { optimalRemoteMiner } from "spawn/body/remote"
import { Memory } from "../../mock"
import Game from "../../mock/Game"

describe("spawn/body/remote", () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should return array when called with no context", function () {
    assert.isArray(optimalRemoteMiner(1000, 1000));
  });

  it("should return minimalist miner", function () {
    const result = optimalRemoteMiner(0, 0)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.lengthOf(result, 4)
    assert.lengthOf(result.filter(p => p === MOVE), 2)
  });

  it("should return maxed miner", function () {
    const result = optimalRemoteMiner(Infinity, 1000)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.equal(result.length, MAX_CREEP_SIZE)
    assert.lengthOf(result.filter(p => p === MOVE), MAX_CREEP_SIZE / 2)
  });

  it("should have only one work part", function () {
    const result = optimalRemoteMiner(Infinity, Infinity)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.equal(result.length, MAX_CREEP_SIZE)
    assert.lengthOf(result.filter(p => p === WORK), 1)
    assert.lengthOf(result.filter(p => p === MOVE), MAX_CREEP_SIZE / 2)
  });

  it("should have only one carry part", function () {
    const result = optimalRemoteMiner(Infinity, 0)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.equal(result.length, MAX_CREEP_SIZE)
    assert.lengthOf(result.filter(p => p === CARRY), 1)
    assert.lengthOf(result.filter(p => p === MOVE), MAX_CREEP_SIZE / 2)
  });
});
