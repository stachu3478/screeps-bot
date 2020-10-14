import '../constants'
import 'overloads/all'
import sinon from 'sinon'
import { expect } from '../../expect'

describe('RoomPosition', () => {
  let roomPosition: RoomPosition
  beforeEach(() => {
    roomPosition = new RoomPosition(12, 34, 'test')
  })

  describe('#rangeXY', () => {
    it('returns y prioritized range', () => {
      expect(roomPosition.rangeXY(14, 44)).to.eq(10)
    })

    it('returns x prioritized range', () => {
      expect(roomPosition.rangeXY(4, 30)).to.eq(8)
    })

    it('returns 0', () => {
      expect(roomPosition.rangeXY(12, 34)).to.eq(0)
    })
  })

  describe('#range', () => {
    const returnValue = 123
    beforeEach(() => {
      roomPosition.rangeXY = sinon.stub().returns(returnValue)
    })

    it('returns rangeXY result', () => {
      expect(roomPosition.range(new RoomPosition(14, 44, 'test2'))).to.eq(123)
    })

    it('calls rangeXY', () => {
      roomPosition.range(new RoomPosition(4, 30, 'test2'))
      expect(roomPosition.rangeXY).to.be.calledOnceWithExactly(4, 30)
    })
  })

  describe('#rangeTo', () => {
    const returnValue = 123
    let roomPos: RoomPosition
    beforeEach(() => {
      roomPosition.range = sinon.stub().returns(returnValue)
      roomPos = new RoomPosition(14, 44, 'test2')
    })

    it('returns range result', () => {
      expect(roomPosition.rangeTo({ pos: roomPos })).to.eq(123)
    })

    it('calls range', () => {
      roomPosition.rangeTo({ pos: roomPos })
      expect(roomPosition.range).to.be.calledOnceWithExactly(roomPos)
    })
  })

  describe('#building', () => {
    const returnValue = [{ id: 0, structureType: STRUCTURE_CONTAINER }]
    beforeEach(() => {
      roomPosition.lookFor = sinon.stub().returns(returnValue)
    })

    it('returns building', () => {
      expect(roomPosition.building(STRUCTURE_CONTAINER)).to.eql(returnValue[0])
    })

    it('does not return building', () => {
      expect(roomPosition.building(STRUCTURE_EXTENSION)).to.be.undefined
    })

    it('calls wizard', () => {
      roomPosition.building(STRUCTURE_EXTENSION)
      expect(roomPosition.lookFor).to.be.calledOnceWithExactly(LOOK_STRUCTURES)
    })
  })
})
