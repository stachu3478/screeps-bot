import "../constants"
import { assert } from "chai";
import { progressiveWorker } from "../../../src/spawn/body"

describe("main", () => {
  it("should export a loop function", function () {
    assert.isTrue(typeof progressiveWorker === "function");
  });

  it("should return number when called with no context", function () {
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
});
