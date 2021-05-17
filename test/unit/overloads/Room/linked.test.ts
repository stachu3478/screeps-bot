import sinon from 'sinon'
import _ from 'lodash'
import 'overloads/all'
import { expect } from '../../../expect'
import RoomLinks from 'overloads/room/RoomLinks'

describe('Detecting ability to transfer energy with links', () => {
  let link: StructureLink
  let room: Room
  let roomLinks: RoomLinks
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    link = { structureType: STRUCTURE_LINK } as StructureLink
    room = {} as Room
    room.memory = {}
    roomLinks = new RoomLinks(room)
    sinon.restore()
  })

  describe('No links description in memory', () => {
    it('returns false', () => {
      expect(roomLinks.finished).to.eql(false)
    })
  })

  describe('No links in room', () => {
    beforeEach(() => {
      room.memory.controllerLink = 'a'
      room.memory.links = 'def'
      room.buildingAt = sinon.stub().returns(undefined)
    })

    it('returns false', () => {
      expect(roomLinks.finished).to.eql(false)
    })
  })

  describe('No controller link in room', () => {
    beforeEach(() => {
      room.memory.links = 'def'
      room.buildingAt = sinon.stub().returns(undefined)
    })

    it('returns false', () => {
      expect(roomLinks.finished).to.eql(false)
    })
  })

  describe('All links in room', () => {
    beforeEach(() => {
      room.memory.controllerLink = 'a'
      room.memory.links = 'def'
      room.buildingAt = sinon.stub().returns(link)
    })

    it('returns true', () => {
      const finished = roomLinks.finished
      expect(room.buildingAt).to.have.callCount(4)
      expect(finished).to.eql(true)
    })
  })
})
