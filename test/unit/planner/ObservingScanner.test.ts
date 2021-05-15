import '../constants'
import { expect } from '../../expect'
import ObservingScanner from 'planner/ObservingScanner'
import Sinon from 'sinon'
import RoomLocation from 'overloads/room/RoomLocation'

describe('ObservingScanner', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)

    const roomName = 'W7N32'
    Memory.myRooms = { [roomName]: 0 }
    room = { name: roomName } as Room
    Game.rooms[roomName] = room
    room.buildings = {} as RoomBuildings
    room.location = new RoomLocation(roomName)
  })

  it('memoizes instance', () => {
    expect(ObservingScanner.instance).to.eq(ObservingScanner.instance)
  })

  context('when observer is unavailable', () => {
    it('returns false', () => {
      const instance = ObservingScanner.instance
      const cb = Sinon.spy()
      expect(instance.scan(cb)).to.be.false
      expect(cb).to.not.be.called
    })
  })

  context('when observer is available', () => {
    let observer: StructureObserver
    beforeEach(() => {
      observer = {} as StructureObserver
      observer.observeRoom = Sinon.stub().returns(OK)
      room.buildings.observer = observer
      observer.room = room
    })

    it('returns true and requests scanning top left room', () => {
      const instance = ObservingScanner.instance
      const cb = Sinon.spy()
      const res = instance.scan(cb)
      expect(observer.observeRoom).to.be.calledOnceWithExactly('W17N42')
      expect(res).to.be.true
      expect(cb).to.not.be.called
    })

    context('when scanned room is available', () => {
      let scanned: Room
      beforeEach(() => {
        scanned = { name: 'W17N42' } as Room
        Game.rooms['W17N42'] = scanned
      })

      it('returns true and calls callback with scanned room', () => {
        const instance = ObservingScanner.instance
        const cb = Sinon.spy()
        const res = instance.scan(cb)
        expect(observer.observeRoom).not.to.be.called
        expect(res).to.be.true
        expect(cb).to.be.calledOnceWithExactly(scanned)
      })
    })
  })
})
