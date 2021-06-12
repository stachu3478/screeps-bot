import _ from 'lodash'
import RoomLocation from 'overloads/room/RoomLocation'
import MyRooms from 'room/MyRooms'
import { expect } from '../../expect'

describe('RoomLocation', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  describe('#findRoomPathStep', () => {
    it('does nothing at no pathscanner', () => {
      const roomLocation = new RoomLocation('test')
      expect(roomLocation.findRoomPathStep('test', 'sim')).to.be.undefined
    })

    it('returns the same room if no entries and target is the same as path from', () => {
      const roomLocation = new RoomLocation('test')
      expect(roomLocation.findRoomPathStep('sim', 'test')?.name).to.eq('test')
    })

    it('returns pathstep matching in any room', () => {
      const room = {} as Room
      room.pathScanner = {} as RoomPathScanner
      room.pathScanner.rooms = {}
      room.pathScanner.rooms['sim'] = {
        x: 12,
        y: 34,
        newX: 13,
        newY: 34,
        through: 'test',
        name: 'sim',
        cost: 123,
        deposits: [],
      }
      const myRooms = { get: () => [room] }
      const roomLocation = new RoomLocation('test')
      expect(
        roomLocation.findRoomPathStep('test', 'sim', myRooms as any),
      ).to.eq(room.pathScanner.rooms['sim'])
    })

    it('returns fake reverse pathstep matching in any room if no direct path', () => {
      const room = {} as Room
      room.pathScanner = {} as RoomPathScanner
      room.pathScanner.rooms = {}
      room.pathScanner.rooms['sim1'] = {
        x: 12,
        y: 0,
        newX: 12,
        newY: 49,
        through: 'test',
        name: 'sim1',
        cost: 123,
        deposits: [],
      }
      room.pathScanner.rooms['sim2'] = {
        x: 15,
        y: 0,
        newX: 15,
        newY: 49,
        through: 'sim1',
        name: 'sim2',
        cost: 321,
        deposits: [],
      }
      const myRooms = { get: () => [room] }
      const roomLocation = new RoomLocation('test')
      expect(
        roomLocation.findRoomPathStep('sim2', 'test', myRooms as any),
      ).to.eql({
        x: 15,
        y: 49,
        newX: 15,
        newY: 0,
        through: 'sim2',
        name: 'sim1',
        cost: 321,
        deposits: [],
      })
    })
  })
})
