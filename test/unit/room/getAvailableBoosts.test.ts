import _ from 'lodash'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('Getting amount of parts that can be boosted with corresponding mineral type overloads/room#getAvailableBoosts', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)

    room = {} as Room
    room.memory = {} as RoomMemory
    room.boosts = new BoostManager(room)
  })

  it('returns 0 for missing terminal', () => {
    expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
  })

  it('returns 0 for empty storage and reservations', () => {
    room.terminal = {
      store: { [RESOURCE_UTRIUM_OXIDE]: 0 },
    } as StructureTerminal
    expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
  })

  it('returns 10 for available all parts', () => {
    room.terminal = {
      store: { [RESOURCE_UTRIUM_OXIDE]: 300 },
    } as StructureTerminal
    expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
  })

  it('returns 10 for more available', () => {
    room.terminal = {
      store: { [RESOURCE_UTRIUM_OXIDE]: Infinity },
    } as StructureTerminal
    expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
  })

  it('returns less for not all parts', () => {
    room.terminal = {
      store: { [RESOURCE_UTRIUM_OXIDE]: 150 },
    } as StructureTerminal
    expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(5)
  })

  describe('Boosts saved', () => {
    beforeEach(() => {
      room.memory.boosts!.labs = [[RESOURCE_UTRIUM_OXIDE, 300]]
      room.memory.boosts!.creeps = []
    })

    it('returns 0 for all parts reserved', () => {
      room.terminal = {
        store: { [RESOURCE_UTRIUM_OXIDE]: 300 },
      } as StructureTerminal
      expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(0)
    })

    it('returns partial amounts', () => {
      room.terminal = {
        store: { [RESOURCE_UTRIUM_OXIDE]: 450 },
      } as StructureTerminal
      expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(5)
    })

    it('ignores reservation', () => {
      room.terminal = {
        store: { [RESOURCE_UTRIUM_OXIDE]: Infinity },
      } as StructureTerminal
      expect(room.boosts.getAvailable(RESOURCE_UTRIUM_OXIDE, 10)).to.eql(10)
    })
  })
})
