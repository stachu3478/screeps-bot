import checkIntegrity from "../../../../src/planner/place/checkIntegrity"
import { expect } from '../../../expect';

describe("planner/place/place", () => {

  it("should return empty string", function () {
    expect(checkIntegrity('', '')).to.eql('');
  });

  it("should return the same string", function () {
    expect(checkIntegrity('abcdef', '')).to.eql('abcdef')
  });

  it("should return the difference", function () {
    expect(checkIntegrity('abcdef', 'abc')).to.eql('def')
  });
});
