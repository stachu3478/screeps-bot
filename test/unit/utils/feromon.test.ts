import sinon from 'sinon'
import { expect } from '../../expect'
import Feromon from 'utils/feromon'

describe('Feromon', () => {
  beforeEach(() => {
    sinon.restore()
    Feromon.cache = { feromon: {} } as WrappedGlobalCache
  })

  describe('.collect', () => {
    it('returns 0', () => {
      expect(Feromon.collect('W12N34', 12, 34)).to.eq(0)
    })

    it('returns 1', () => {
      Feromon.increment('W12N34', 12, 34)
      expect(Feromon.collect('W12N34', 12, 34)).to.eq(1)
    })

    it('returns 2', () => {
      Feromon.increment('W12N34', 12, 34)
      Feromon.increment('W12N34', 12, 34)
      expect(Feromon.collect('W12N34', 12, 34)).to.eq(2)
    })

    it('returns 4', () => {
      Feromon.increment('W12N34', 13, 34)
      Feromon.increment('W12N34', 12, 33)
      Feromon.increment('W12N34', 13, 35)
      Feromon.increment('W12N34', 11, 33)
      Feromon.increment('W12N34', 14, 34)
      expect(Feromon.collect('W12N34', 12, 34)).to.eq(4)
    })
  })
})
