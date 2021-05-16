import sinon from 'sinon'
import defineGetter from 'utils/defineGetter'
import { expect } from '../../expect'

interface TruthyTest extends ObjectConstructor {
  foo: true
}
describe('Creating getter on given contructor', () => {
  let iterator: () => void
  let Test: TruthyTest
  beforeEach(() => {
    sinon.restore()
    iterator = sinon.stub()
    Test = class Test {} as TruthyTest
  })

  describe('defining some getter on class using method', () => {
    beforeEach(() => {
      defineGetter<TruthyTest, TruthyTest['constructor'], 'foo'>(
        Test,
        'foo',
        () => true,
      )
    })

    it('havs that property available', () => {
      const test = new Test()
      // @ts-ignore meta-programming
      expect(test.foo).to.eql(true)
    })
  })
})
