import '../constants'
import extract from '../../../src/routine/work/extract'
import { expect } from '../../expect';
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

let creep: Creep
describe('routine/extract', () => {
  beforeEach(() => {
    creep = {} as Creep
  });

  context('when creep is full', () => {
    beforeEach(() => {
      creep.store = { getFreeCapacity: () => 0 } as Creep['store']
    })


    it('returns DONE', function () {
      expect(extract(creep)).to.eql(DONE)
    });
  })

  context('when creep is not full', () => {
    beforeEach(() => {
      creep.store = { getFreeCapacity: () => 100 } as Creep['store']
    })

    context('when target is missing', () => {
      beforeEach(() => {
        creep.motherRoom = {} as Room
      })

      it('returns NOTHING_TODO', function () {
        expect(extract(creep)).to.eql(NOTHING_TODO)
      });
    })

    context('when target is available', () => {
      beforeEach(() => {
        creep.motherRoom = { mineral: { mineralAmount: 100, mineralType: 'U' } } as Room
      })

      it('returns NOTHING_DONE when moving') // Need to refactor moveCheap

      it('returns NOTHING_DONE when tired', () => {
        creep.harvest = (t: any) => ERR_TIRED
        expect(extract(creep)).to.eql(NOTHING_DONE)
      })

      it('returns NOTHING_TODO when extractor not found', () => {
        creep.harvest = (t: any) => ERR_NOT_FOUND
        expect(extract(creep)).to.eql(NOTHING_TODO)
      })

      it('returns FAILED for any other error', () => {
        creep.harvest = (t: any) => ERR_NO_BODYPART
        expect(extract(creep)).to.eql(FAILED)
      })

      context('when mining is succesful', () => {
        beforeEach(() => {
          creep.harvest = (t: any) => OK
        })

        it('returns SUCCESS when not done', () => {
          creep.workpartCount = 1
          expect(extract(creep)).to.eql(SUCCESS)
        })

        it('returns DONE when done', () => {
          creep.workpartCount = Infinity
          expect(extract(creep)).to.eql(DONE)
        })
      })
    })
  })
});
