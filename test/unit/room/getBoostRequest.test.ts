import _ from 'lodash'
import sinon from 'sinon'
import boostData from '../mock/boostData'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('Getting a boost request', () => {
  let room: Room
  let boosts: BoostData
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.memory = {}
    boosts = room.memory.boosts = boostData()
    room.boosts = new BoostManager(room)
    sinon.restore()
    sinon.spy(room.boosts, 'clearRequests')
    lab = {
      id: 'lab',
      mineralType: RESOURCE_UTRIUM_ACID,
      store: {},
    } as StructureLab
    room.externalLabs = [lab]
  })

  describe('empty boost data', () => {
    it('returns null', () => {
      room.boosts.getRequest('John')
      expect(room.boosts.getRequest('John')).to.be.undefined
    })
  })

  describe('no creep matching', () => {
    it('returns null and call no action', () => {
      boosts.creeps.push(['Johny', RESOURCE_UTRIUM_ACID, 300, 0])
      boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
      const sameBoosts = _.clone(boosts, true)
      room.boosts.getRequest('John')
      expect(room.boosts.getRequest('John')).to.be.undefined
      expect(room.boosts.clearRequests).to.not.be.called
      expect(boosts).to.eql(sameBoosts)
    })
  })

  describe('boost data exist', () => {
    describe('labs not exist', () => {
      beforeEach(() => {
        room.externalLabs = []
      })

      it('does not return boost data', () => {
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        room.boosts.getRequest('John')
        expect(room.boosts.getRequest('John')).to.be.undefined
      })
    })

    describe('no lab with that mineral type', () => {
      beforeEach(() => {
        room.externalLabs[0].mineralType = null
      })

      it('does not return boost data', () => {
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        room.boosts.getRequest('John')
        expect(room.boosts.clearRequests).to.be.calledOnce
        expect(room.boosts.getRequest('John')).to.be.undefined
      })

      it('returns null and call delete for all for missing resources', () => {
        const sameBoosts = _.clone(boosts, true)
        boosts.creeps.push(
          ['John', RESOURCE_UTRIUM_ALKALIDE, 300, 0],
          ['John', RESOURCE_CATALYZED_GHODIUM_ACID, 600, 0],
        )
        boosts.labs = [
          [RESOURCE_UTRIUM_ALKALIDE, 300],
          [RESOURCE_CATALYZED_GHODIUM_ACID, 600],
        ]
        room.boosts.getRequest('John')
        expect(room.boosts.clearRequests).to.be.calledTwice
        expect(room.boosts.getRequest('John')).to.be.undefined
        expect(boosts).to.eql(sameBoosts)
      })
    })

    describe('exact lab exists', () => {
      it('returns boost data', () => {
        boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
        boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
        lab.store[RESOURCE_UTRIUM_ACID] = 300
        room.boosts.getRequest('John')
        expect(room.boosts.getRequest('John')).to.eql('lab')
      })

      describe('not enough resource in lab', () => {
        it('returns boost data', () => {
          boosts.creeps.push(['John', RESOURCE_UTRIUM_ACID, 300, 0])
          boosts.labs.push([RESOURCE_UTRIUM_ACID, 300])
          lab.store[RESOURCE_UTRIUM_ACID] = 299
          room.boosts.getRequest('John')
          expect(room.boosts.getRequest('John')).to.be.undefined
        })
      })
    })
  })
})
