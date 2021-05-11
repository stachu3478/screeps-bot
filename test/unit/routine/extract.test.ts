import sinon from 'sinon'
import '../constants'
import extract from '../../../src/routine/work/extract'
import { expect } from '../../expect'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'
import CreepCorpus from 'overloads/creep/CreepCorpus'

let creep: Creep
describe('routine/extract', () => {
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    creep = { name: 'test' } as Creep
    Game.creeps[creep.name] = creep
    creep.body = []
    creep.corpus = new CreepCorpus(creep)
  })

  context('when creep is full', () => {
    beforeEach(() => {
      creep.store = { getFreeCapacity: () => 0 } as Creep['store']
    })

    it('returns DONE', () => {
      expect(extract(creep)).to.eql(DONE)
    })
  })

  context('when creep is not full', () => {
    beforeEach(() => {
      creep.store = { getFreeCapacity: () => 100 } as Creep['store']
    })

    context('when target is missing', () => {
      beforeEach(() => {
        creep.motherRoom = {} as Room
      })

      it('returns NOTHING_TODO', () => {
        expect(extract(creep)).to.eql(NOTHING_TODO)
      })
    })

    context('when target is available', () => {
      beforeEach(() => {
        creep.motherRoom = {
          mineral: { mineralAmount: 100, mineralType: 'U' },
        } as Room
      })

      it('returns NOTHING_DONE when moving', () => {
        creep.harvest = (t: any) => ERR_NOT_IN_RANGE
        expect(extract(creep, () => OK)).to.eql(NOTHING_DONE)
      })

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
          creep.corpus = {} as CreepCorpus
          creep.corpus.count = sinon.spy(() => 1)
          expect(extract(creep)).to.eql(SUCCESS)
          expect(creep.corpus.count).to.be.calledOnceWithExactly(WORK)
        })

        it('returns DONE when done', () => {
          creep.corpus = {} as CreepCorpus
          creep.corpus.count = sinon.spy(() => Infinity)
          expect(extract(creep)).to.eql(DONE)
          expect(creep.corpus.count).to.be.calledOnceWithExactly(WORK)
        })
      })
    })
  })
})
