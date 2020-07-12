import sinon from 'sinon'
import defineGetter from 'utils/defineGetter';
import { expect } from '../../expect';

type Test = ObjectConstructor
describe('Creating getter on given contructor', () => {
  let iterator: () => void
  let Test: Test
  beforeEach(() => {
    sinon.restore()
    iterator = sinon.stub()
    Test = class Test { } as Test
  });

  describe('defining some getter on class using method', () => {
    beforeEach(() => {
      defineGetter<Test, Test['constructor'], true>(Test, 'test', () => true)
    })

    it('Should have that property available', () => {
      const test = new Test()
      // @ts-ignore meta-programming
      expect(test.test).to.eql(true)
    })
  })
});
