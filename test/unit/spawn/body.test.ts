import "../constants"
import { assert } from "chai";
import { progressiveWorker, progressiveCommander } from "../../../src/spawn/body"

describe("main", () => {
  it("should export a loop function", function () {
    assert.isTrue(typeof progressiveWorker === "function");
  });

  it("should return array when called with no context", function () {
    assert.isArray(progressiveWorker(1000));
  });

  it("should return minimalist worker", function () {
    const result = progressiveWorker(0)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.lengthOf(result, 3)
  });

  it("should return bigger worker", function () {
    const result = progressiveWorker(300)
    assert.includeMembers(result, [WORK, MOVE, CARRY]);
    assert.isAtLeast(result.length, 4)
  });

  it("should return even bigger worker", function () {
    console.log(progressiveWorker(350))
    assert.notDeepEqual(progressiveWorker(300), progressiveWorker(350));
  });

  it("should return array when called with no context", function () {
    assert.isArray(progressiveCommander(1000, 1));
  });

  it("should return commander with at least 1 per MOVE, HEAL, TOUGH, ATTACK parts", function () {
    const result = progressiveCommander(0, 1)
    assert.includeMembers(result, [MOVE, HEAL, TOUGH, ATTACK]);
    assert.lengthOf(result, 6)
  });

  it("should return bigger commander", function () {
    const result = progressiveCommander(0, 2)
    assert.includeMembers(result, [MOVE, HEAL, TOUGH, ATTACK]);
    assert.isAtLeast(result.length, 10)
  });

  it("should return as many heal parts as possible", function () {
    const result = progressiveCommander(10 * (BODYPART_COST[HEAL] + BODYPART_COST[MOVE]), 0)
    console.log(result)
    assert.includeMembers(result, [MOVE, HEAL]);
    assert.equal(result.length, 20)
    assert.equal(result.filter(p => p === HEAL).length, 10)
  });

  it("should return commander maxed out", function () {
    const result = progressiveCommander(1000000, 2)
    assert.equal(result.length, MAX_CREEP_SIZE)
  });
});
