import _ from 'lodash'
import sinon from 'sinon'
import boostData from '../mock/boostData'
import { expect } from '../../expect'

describe('Adding a boost request', () => {
  let room: Room
  let boosts: BoostData
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = new Room('test')
    boosts = boostData()
    room.getBoosts = () => boosts
    sinon.restore()
  })

  describe('no lab entry for resource type', () => {
    describe('zero amount in lab entry array', () => {
      it('modifies entry in empty amount field', function () {
        boosts.labs = [
          [RESOURCE_GHODIUM_ALKALIDE, 0],
          [RESOURCE_UTRIUM_ACID, 500],
        ]
        const newBoosts = _.clone(boosts, true)
        newBoosts.labs = [
          [RESOURCE_UTRIUM_ALKALIDE, 10 * LAB_BOOST_MINERAL],
          [RESOURCE_UTRIUM_ACID, 500],
        ]
        newBoosts.creeps.push([
          'John',
          RESOURCE_UTRIUM_ALKALIDE,
          10 * LAB_BOOST_MINERAL,
          0,
        ])
        room.createBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE, 10)
        expect(boosts).to.eql(newBoosts)
      })
    })
    describe('array needs to be extended', () => {
      it('adds new entry', function () {
        boosts.labs = [[RESOURCE_UTRIUM_ALKALIDE, 500]]
        const newBoosts = _.clone(boosts, true)
        newBoosts.labs = [
          [RESOURCE_UTRIUM_ALKALIDE, 500],
          [RESOURCE_UTRIUM_ACID, 10 * LAB_BOOST_MINERAL],
        ]
        newBoosts.creeps.push([
          'John',
          RESOURCE_UTRIUM_ACID,
          10 * LAB_BOOST_MINERAL,
          0,
        ])
        room.createBoostRequest('John', RESOURCE_UTRIUM_ACID, 10)
        expect(boosts).to.eql(newBoosts)
      })
    })
  })

  describe('lab entry for resource type exist', () => {
    let newBoosts: BoostData
    beforeEach(() => {
      boosts.labs = [
        [RESOURCE_GHODIUM_HYDRIDE, 0],
        [RESOURCE_UTRIUM_ALKALIDE, 500],
      ]
      newBoosts = _.clone(boosts, true)
      newBoosts.labs = [
        [RESOURCE_GHODIUM_HYDRIDE, 0],
        [RESOURCE_UTRIUM_ALKALIDE, 500 + 10 * LAB_BOOST_MINERAL],
      ]
    })

    it('changes the entry properly', function () {
      newBoosts.creeps.push([
        'John',
        RESOURCE_UTRIUM_ALKALIDE,
        10 * LAB_BOOST_MINERAL,
        0,
      ])
      room.createBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE, 10)
      expect(boosts).to.eql(newBoosts)
    })

    it('creates mandatory boost explicit', function () {
      newBoosts.creeps.push([
        'John',
        RESOURCE_UTRIUM_ALKALIDE,
        10 * LAB_BOOST_MINERAL,
        1,
      ])
      room.createBoostRequest('John', RESOURCE_UTRIUM_ALKALIDE, 10, true)
      expect(boosts).to.eql(newBoosts)
    })
  })
})
