import '../../constants'
import 'overloads/all'
import sinon from 'sinon'
import { expect } from '../../../expect'
import xyToChar from 'planner/pos'

describe('Room', () => {
  let room: Room
  beforeEach(() => {
    room = new Room('test')
    room.memory.externalLabs = '123'
    room.memory.internalLabs = '456'
    room.memory.links = '78'
    room.memory.controllerLink = '9'
  })
  ;[
    [
      'cache',
      'rooms',
      { scoutsWorking: 0, sourceKeeperPositions: [], structurePositions: [] },
    ],
  ].forEach((keys) => {
    describe(`#${keys[0]}`, () => {
      it('value is cached', () => {
        expect(room[keys[0] as keyof Room]).to.eq(room[keys[0] as keyof Room])
      })

      it('has default value specified such', () => {
        expect(room[keys[0] as keyof Room]).to.eql(keys[2])
      })
    })
  })

  describe('#lab1 #lab2', () => {
    const labs = '0123456789'
    const returnValue = { id: 0 }
    beforeEach(() => {
      room.memory.internalLabs = labs
      room.buildingAt = sinon.stub().returns(returnValue)
    })

    it('returns first indegrient lab', () => {
      expect(room.lab1).to.eq(returnValue)
    })

    it('returns second indegrient lab', () => {
      expect(room.lab2).to.eq(returnValue)
    })

    it('calls building lock wizard at lab1', () => {
      room.lab1
      expect(room.buildingAt).to.be.calledOnceWithExactly(
        labs.charCodeAt(0),
        STRUCTURE_LAB,
      )
    })

    it('calls building lock wizard at lab2', () => {
      room.lab2
      expect(room.buildingAt).to.be.calledOnceWithExactly(
        labs.charCodeAt(1),
        STRUCTURE_LAB,
      )
    })
  })

  describe('#externalLabs', () => {
    const returnValue = { id: 0 }
    beforeEach(() => {
      room.labsFromChars = sinon.stub().returns(returnValue)
    })

    it('returns external labs', () => {
      expect(room.externalLabs).to.eq(returnValue)
    })

    it('calls labsFromChars', () => {
      room.externalLabs
      expect(room.labsFromChars).to.be.calledOnceWithExactly('123')
    })
  })

  describe('#mineral', () => {
    const returnValue = [{ id: 0 }]
    beforeEach(() => {
      room.find = sinon.stub().returns(returnValue)
    })

    it('returns first found mineral', () => {
      expect(room.mineral).to.eq(returnValue[0])
    })

    it('calls finder', () => {
      room.mineral
      expect(room.find).to.be.calledOnceWithExactly(FIND_MINERALS)
    })
  })

  describe('#spawn', () => {
    const returnValue = [{ id: 0 }]
    beforeEach(() => {
      room.find = sinon.stub().returns(returnValue)
    })

    it('returns first found spawn', () => {
      expect(room.spawn).to.eq(returnValue[0])
    })

    it('calls finder', () => {
      room.spawn
      expect(room.find).to.be.calledOnceWithExactly(FIND_MY_SPAWNS)
    })
  })

  describe('#sources', () => {
    it('value is cached', () => {
      expect(room.sources).to.eq(room.sources)
    })
  })

  describe('#store', () => {
    it('returns stored resource both in terminal and storage', () => {
      room.storage = { store: { [RESOURCE_ENERGY]: 300 } } as StructureStorage
      room.terminal = { store: { [RESOURCE_ENERGY]: 200 } } as StructureTerminal
      expect(room.store(RESOURCE_ENERGY)).to.eq(500)
    })
  })

  describe('#positionFromChar', () => {
    const returnValue = { id: 0 }
    beforeEach(() => {
      room.getPositionAt = sinon.stub().returns(returnValue)
    })

    it('returns room position based on char', () => {
      expect(
        room.positionFromChar(String.fromCharCode(xyToChar(12, 34))),
      ).to.eq(returnValue)
    })

    it('uses wizard', () => {
      room.positionFromChar(String.fromCharCode(xyToChar(12, 34)))
      expect(room.getPositionAt).to.be.calledOnceWithExactly(12, 34)
    })
  })

  describe('#buildingAt', () => {
    const returnValue = [{ id: 0, structureType: STRUCTURE_CONTAINER }]
    beforeEach(() => {
      room.lookForAt = sinon.stub().returns(returnValue)
    })

    it('returns building that matches type at specified position', () => {
      expect(room.buildingAt(xyToChar(12, 34), STRUCTURE_CONTAINER)).to.eq(
        returnValue[0],
      )
    })

    it('returns nothing if does not match', () => {
      expect(room.buildingAt(xyToChar(12, 34), STRUCTURE_EXTENSION)).to.be
        .undefined
    })

    it('calls lookForAt', () => {
      room.buildingAt(xyToChar(12, 34), STRUCTURE_EXTENSION)
      expect(room.lookForAt).to.be.calledOnceWithExactly(
        LOOK_STRUCTURES,
        12,
        34,
      )
    })
  })

  describe('#labsFromChars', () => {
    context('when buildings present', () => {
      const returnValue = { id: 0 }
      beforeEach(() => {
        room.buildingAt = sinon.stub().returns(returnValue)
      })

      it('returns equal to wizard results', () => {
        expect(room.labsFromChars('abc')).to.have.all.members([
          returnValue,
          returnValue,
          returnValue,
        ])
      })

      it('returns calls wizard 3 times', () => {
        room.labsFromChars('abc')
        expect(room.buildingAt).to.be.calledThrice
      })
    })

    context('when buildings not present', () => {
      beforeEach(() => {
        room.buildingAt = sinon.stub().returns(null)
      })

      it('returns empty array', () => {
        expect(room.labsFromChars('abc')).to.be.an('Array').that.is.empty
      })

      it('calls wizard', () => {
        room.labsFromChars('a')
        expect(room.buildingAt).to.be.calledOnceWithExactly(
          'a'.charCodeAt(0),
          STRUCTURE_LAB,
        )
      })
    })
  })

  describe('#my', () => {
    it('returns true when controller my', () => {
      room.controller = { my: true } as StructureController
      expect(room.my).to.be.true
    })

    it('returns false when controller not my', () => {
      room.controller = {} as StructureController
      expect(room.my).to.be.false
    })

    it('returns false when no controller', () => {
      delete room.controller
      expect(room.my).to.be.false
    })
  })
})
