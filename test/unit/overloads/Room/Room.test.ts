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
    ['cache', 'rooms'],
    ['factoryCache', 'factories'],
    ['powerSpawnCache', 'powerSpawns'],
  ].forEach((keys) => {
    describe(`#${keys[0]}`, () => {
      context('value is not cached', () => {
        it('returns empty object', () => {
          expect(room[keys[0] as keyof Room]).to.eql({})
        })
      })

      context('value is cached', () => {
        const cachedObject = { lvl: 1 }
        beforeEach(() => {
          const typedCache = global.Cache[
            keys[1] as keyof WrappedGlobalCache
          ] as GlobalCache['rooms']
          typedCache['test'] = cachedObject
        })

        it('returns cached object', () => {
          expect(room[keys[0] as keyof Room]).to.eq(cachedObject)
        })
      })
    })
  })

  describe('#factory', () => {
    const structs = '0123456789'
    const returnValue = { id: 0 }
    beforeEach(() => {
      room.memory.structs = structs
      room.buildingAt = sinon.stub().returns(returnValue)
    })

    it('returns factory from locked position', () => {
      expect(room.factory).to.eq(returnValue)
    })

    it('calls building lock wizard', () => {
      room.factory
      expect(room.buildingAt).to.be.calledOnceWithExactly(
        structs.charCodeAt(4),
        STRUCTURE_FACTORY,
      )
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

  describe('#allLabs', () => {
    const returnValue = { id: 0 }
    beforeEach(() => {
      room.labsFromChars = sinon.stub().returns(returnValue)
    })

    it('returns all labs', () => {
      expect(room.allLabs).to.eq(returnValue)
    })

    it('calls labsFromChars', () => {
      room.allLabs
      expect(room.labsFromChars).to.be.calledOnceWithExactly('123456')
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

  describe('#extractor', () => {
    const returnMineral = [{} as Mineral]
    const returnExtractor = { id: 0 }
    beforeEach(() => {
      room.find = sinon.stub().returns(returnMineral)
      returnMineral[0].pos = {} as RoomPosition
      returnMineral[0].pos.building = sinon.stub().returns(returnExtractor)
    })

    it('returns extractor', () => {
      expect(room.extractor).to.eq(returnExtractor)
    })

    it('calls finder', () => {
      room.extractor
      expect(returnMineral[0].pos.building).to.be.calledOnceWithExactly(
        STRUCTURE_EXTRACTOR,
      )
    })
  })

  describe('#filled', () => {
    context('when all properties mean filled', () => {
      beforeEach(() => {
        room.cache.priorityFilled = 1
        room.energyAvailable = room.energyCapacityAvailable = 100
      })

      it('returns true', () => {
        expect(room.filled).to.be.true
      })
    })

    context('when cache properties not mean filled', () => {
      beforeEach(() => {
        room.cache.priorityFilled = 0
        room.energyAvailable = room.energyCapacityAvailable = 100
      })

      it('returns false', () => {
        expect(room.filled).to.be.false
      })
    })

    context('when energy avaibility properties not mean filled', () => {
      beforeEach(() => {
        room.cache.priorityFilled = 1
        room.energyAvailable = 90
        room.energyCapacityAvailable = 100
      })

      it('returns false', () => {
        expect(room.filled).to.be.false
      })
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

  describe('#powerSpawn', () => {
    const returnValue = { id: 0 }
    const structs = '000000000001'
    beforeEach(() => {
      room.memory.structs = structs
      room.buildingAt = sinon.stub().returns(returnValue)
    })

    it('returns wizard rezult', () => {
      expect(room.powerSpawn).to.eq(returnValue)
    })

    it('calls wizard', () => {
      room.powerSpawn
      expect(room.buildingAt).to.be.calledOnceWithExactly(
        '1'.charCodeAt(0),
        STRUCTURE_POWER_SPAWN,
      )
    })
  })

  describe('#sources', () => {
    context('when value not cached', () => {
      beforeEach(() => {
        delete room._sourceHandler
      })

      it('returns new instance', () => {
        expect(room.sources).to.eq(room._sourceHandler)
      })
    })

    context('when value cached', () => {
      const cached = {} as SourceHandler
      beforeEach(() => {
        room._sourceHandler = cached
      })

      it('returns cached instance', () => {
        expect(room.sources).to.eq(cached)
      })
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
