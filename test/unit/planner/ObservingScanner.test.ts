import '../constants'
import { expect } from '../../expect'
import ObservingScanner from 'planner/ObservingScanner'
import Sinon from 'sinon'
import RoomLocation from 'overloads/room/RoomLocation'

describe('ObservingScanner', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    const roomName = 'W7N32'
    Memory.myRooms = { W6N32: 0, [roomName]: 0, W8N32: 0 }
    room = { name: roomName } as Room
    Game.rooms[roomName] = room
    room.buildings = {} as RoomBuildings
    room.location = new RoomLocation(roomName)
    room.controller = {} as StructureController
    room.memory = { creeps: { John: 0 } }
  })

  it('memoizes instance', () => {
    expect(ObservingScanner.instance).to.eq(ObservingScanner.instance)
  })

  context('when observer is unavailable', () => {
    it('returns false', () => {
      const cb = Sinon.spy()
      expect(new ObservingScanner().scan(cb)).to.be.false
      expect(cb).to.not.be.called
    })
  })

  context('when observer is available', () => {
    let observer: StructureObserver
    beforeEach(() => {
      observer = {} as StructureObserver
      observer.isActive = () => true
      observer.observeRoom = Sinon.stub().returns(OK)
      room.buildings.observer = observer
      observer.room = room
    })

    it('returns true and requests scanning top left room', () => {
      const cb = Sinon.spy()
      const res = new ObservingScanner().scan(cb)
      expect(res).to.be.true
      expect(observer.observeRoom).to.be.calledOnceWithExactly('W17N42')
      expect(cb).to.not.be.called
    })

    context('when W17N42 is already scanned', () => {
      beforeEach(() => {
        room.pathScanner = {} as RoomPathScanner
        room.pathScanner.rooms = { W17N42: {} as RoomNeighbourPath }
      })

      it('returns true and requests scanning next room to the left', () => {
        const scanner = new ObservingScanner()
        scanner.filterToScanFromPathScanners()
        const cb = Sinon.spy()
        const res = scanner.scan(cb)
        expect(res).to.be.true
        expect(observer.observeRoom).to.be.calledOnceWithExactly('W16N42')
        expect(cb).to.not.be.called
      })
    })

    context('when scanned room is available', () => {
      let scanned: Room
      beforeEach(() => {
        scanned = { name: 'W17N42' } as Room
        Game.rooms['W17N42'] = scanned
      })

      it('returns true and calls callback with scanned room', () => {
        const cb = Sinon.spy()
        const res = new ObservingScanner().scan(cb)
        expect(observer.observeRoom).not.to.be.called
        expect(res).to.be.true
        expect(cb).to.be.calledOnceWithExactly(scanned)
      })
    })
  })
})
