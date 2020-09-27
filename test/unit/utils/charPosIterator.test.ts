import sinon from 'sinon'
import charPosIterator from 'utils/charPosIterator'
import { expect } from '../../expect'

describe('Check for creep is moving', () => {
  let iterator: () => void
  beforeEach(() => {
    sinon.restore()
    iterator = sinon.stub()
  })

  describe('starting from 0', () => {
    it('Should start iteration from 0', () => {
      charPosIterator('abc', iterator)
      expect(iterator).to.be.calledThrice
      expect(iterator).to.be.calledWith(97 & 63, 97 >> 6, 97, 0, 0)
      expect(iterator).to.be.calledWith(98 & 63, 98 >> 6, 98, 1, 1)
      expect(iterator).to.be.calledWith(99 & 63, 99 >> 6, 99, 2, 2)
    })
  })

  describe('starting from 2', () => {
    it('Should start iteration from 2', () => {
      charPosIterator('abcde', iterator, 2)
      expect(iterator).to.have.callCount(5)
      expect(iterator).to.be.calledWith(99 & 63, 99 >> 6, 99, 0, 2)
      expect(iterator).to.be.calledWith(100 & 63, 100 >> 6, 100, 1, 3)
      expect(iterator).to.be.calledWith(101 & 63, 101 >> 6, 101, 2, 4)
      expect(iterator).to.be.calledWith(97 & 63, 97 >> 6, 97, 3, 0)
      expect(iterator).to.be.calledWith(98 & 63, 98 >> 6, 98, 4, 1)
    })
  })
})
