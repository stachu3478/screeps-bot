import _ from 'lodash'
import sinon from 'sinon'

import BoostManager from 'overloads/room/BoostManager'
import { expect } from '../../expect'
import boostData from '../mock/boostData'

describe('Getting best option for boosting action', () => {
  let room: Room
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.memory = {} as RoomMemory
    room.memory.boosts = boostData()
    room.boosts = new BoostManager(room)
    room.terminal = {
      store: {
        [RESOURCE_GHODIUM_HYDRIDE]: 300,
        [RESOURCE_GHODIUM_ACID]: 0,
        [RESOURCE_CATALYZED_GHODIUM_ACID]: 0,
      },
    } as StructureTerminal
    lab = {} as StructureLab
    room.externalLabs = [lab]
    sinon.restore()
  })

  describe('no terminal', () => {
    it('returns null', () => {
      delete room.terminal
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql(null)
    })
  })

  describe('no external labs', () => {
    it('returns null', () => {
      room.externalLabs = []
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql(null)
    })
  })

  describe('no resource in terminal', () => {
    it('returns null', () => {
      room.terminal = room.terminal || ({} as StructureTerminal)
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 0
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql(null)
    })
  })

  describe('only weakiest resource in terminal', () => {
    it('returns the weakiest resource', () => {
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql({
        partCount: 300 / LAB_BOOST_MINERAL,
        resource: RESOURCE_GHODIUM_HYDRIDE,
      })
    })
  })

  describe('more resources in terminal', () => {
    it('returns the better resource', () => {
      room.terminal = room.terminal || ({} as StructureTerminal)
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql({
        partCount: 300 / LAB_BOOST_MINERAL,
        resource: RESOURCE_GHODIUM_ACID,
      })
    })
  })

  describe('more amounts not needed', () => {
    it('respects better resource', () => {
      room.terminal = room.terminal || ({} as StructureTerminal)
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 3000
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 10),
      ).to.eql({
        partCount: 300 / LAB_BOOST_MINERAL,
        resource: RESOURCE_GHODIUM_ACID,
      })
    })
  })

  describe('more amounts needed', () => {
    it('respects better amount', () => {
      room.terminal = room.terminal || ({} as StructureTerminal)
      room.terminal.store[RESOURCE_GHODIUM_HYDRIDE] = 3000
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 100),
      ).to.eql({
        partCount: 3000 / LAB_BOOST_MINERAL,
        resource: RESOURCE_GHODIUM_HYDRIDE,
      })
    })
  })

  describe('less amount available', () => {
    it('requests lower amount', () => {
      room.terminal = room.terminal || ({} as StructureTerminal)
      room.terminal.store[RESOURCE_GHODIUM_ACID] = 300
      expect(
        room.boosts.getBestAvailable('work', 'upgradeController', 100),
      ).to.eql({
        partCount: 300 / LAB_BOOST_MINERAL,
        resource: RESOURCE_GHODIUM_ACID,
      })
    })
  })
})
