import '../constants'
import { assert, expect } from '../../expect'
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
    Game.rooms = {}
    Game.rooms[roomName] = room
    Game.rooms['W6N32'] = { name: 'W6N32', buildings: {} } as Room
    Game.rooms['W8N32'] = { name: 'W8N32', buildings: {} } as Room
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

    it('does not scan E4N42 at any of 44 iterations', () => {
      const scanned: Record<string, number> = {}
      observer.observeRoom = (name) => {
        Game.rooms[name] = { name } as Room
        return OK
      }
      const cb = (room: Room) => {
        assert.equal(scanned[room.name], undefined)
        scanned[room.name] = 1
        expect(room).not.to.eq('E4N42')
      }
      const scanner = new ObservingScanner()
      new Array(44).fill(1).forEach((i) => {
        scanner.scan(cb)
      })
    })

    it('scans specified rooms at 900 iterations and returns false thereafter', () => {
      const scannedArray: string[] = []
      const scanned: Record<string, number> = {}
      observer.observeRoom = (name) => {
        Game.rooms[name] = { name } as Room
        return OK
      }
      const cb = (room: Room) => {
        assert.equal(scanned[room.name], undefined)
        scanned[room.name] = 1
        scannedArray.push(room.name)
      }
      const scanner = new ObservingScanner()
      new Array(900).fill(1).forEach((i) => {
        scanner.scan(cb)
      })
      expect(scannedArray).not.to.include('W18N42')
      expect(scannedArray[0]).to.eq('W17N42')
      expect(scannedArray[1]).to.eq('W16N42')
      expect(scannedArray[10]).to.eq('W7N42')
      expect(scannedArray[20]).to.eq('E2N42')
      expect(scannedArray).not.to.include('E3N42')
      expect(scannedArray[21]).to.eq('W17N41')
      expect(scannedArray).not.to.include('W17N43')
      expect(scannedArray[440]).to.eq('E2N22')
      expect(scannedArray[420]).to.eq('W17N22')
      expect(scannedArray).not.to.include('W18N22')
      expect(scannedArray).not.to.include('W17N21')
      // tslint:disable-next-line: no-unused-expression
      expect(scannedArray[441]).to.be.undefined
      expect(scannedArray).to.have.lengthOf(441)
      // tslint:disable-next-line: no-unused-expression
      expect(scanner.scan(cb)).to.be.false
    })

    context('when W17N42 is already scanned', () => {
      beforeEach(() => {
        room.pathScanner = {} as RoomPathScanner
        room.pathScanner.rooms = { W17N42: {} as RoomNeighbourPath }
      })

      it('returns true and requests scanning next room to the left', () => {
        const scanner = new ObservingScanner()
        scanner.filterToScanFromPathScanners({
          get: () => [{ pathScanner: { rooms: { W17N42: {} } } }],
        } as any)
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
