import sinon from 'sinon'
import _ from 'lodash'
import 'overloads/all'
import { expect } from '../../../expect'

describe('Detecting ability to transfer energy with links', () => {
  let link: StructureLink
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    link = { structureType: STRUCTURE_LINK } as StructureLink
    room = new Room('test')
    sinon.restore()
  })

  describe('No links description in memory', () => {
    it('returns false', () => {
      expect(room.links.finished).to.eql(false)
    })
  })

  describe('No links in room', () => {
    beforeEach(() => {
      room.memory.controllerLink = 'a'
      room.memory.links = 'def'
      sinon.stub(room, 'buildingAt').returns(undefined)
    })

    it('returns false', () => {
      expect(room.links.finished).to.eql(false)
    })
  })

  describe('No controller link in room', () => {
    beforeEach(() => {
      room.memory.links = 'def'
      sinon.stub(room, 'buildingAt').returns(undefined)
    })

    it('returns false', () => {
      expect(room.links.finished).to.eql(false)
    })
  })

  describe('All links in room', () => {
    beforeEach(() => {
      room.memory.controllerLink = 'a'
      room.memory.links = 'def'
      sinon.stub(room, 'buildingAt').returns(link)
    })

    it('returns true', () => {
      expect(room.links.finished).to.eql(true)
    })
  })
})
