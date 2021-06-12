import '../constants'
import 'overloads/all'
import sinon from 'sinon'
import { expect } from '../../expect'
import SourceHandler from 'handler/SourceHandler'
import xyToChar from 'planner/pos'
import { Miner } from 'role/creep/miner'
import Game from '../mock/Game'

const sourcePosition = String.fromCharCode(xyToChar(12, 34))
const sourceDistance = String.fromCharCode(123)
const creepName = 'creepName'
let colonySources: string[]
let room: Room
let sourceHandler: SourceHandler
describe('SourceHandler', () => {
  beforeEach(() => {
    colonySources = [`${sourcePosition}${sourceDistance}${creepName}`, '12John']
    room = {
      memory: {
        [RoomMemoryKeys.sourceInfo]: colonySources,
        [RoomMemoryKeys.colonySourceIndex]: 1,
      } as RoomMemory,
      name: 'roomName',
    } as Room
    sourceHandler = new SourceHandler(room)

    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
  })

  describe('#assign', () => {
    context('when source is being assigned to new creep', () => {
      const newCreepName = 'newCreepName'
      beforeEach(() => {
        sourceHandler.assign('newCreepName', 0)
      })

      it('overwrites creep name part', () => {
        expect(colonySources[0]).to.eq(
          `${sourcePosition}${sourceDistance}${newCreepName}`,
        )
      })
    })
  })

  describe('#getPosition', () => {
    const returnValue = {}
    beforeEach(() => {
      room.positionFromChar = sinon.stub().returns(returnValue)
    })

    it('returns mining position', () => {
      expect(sourceHandler.getPosition(0)).to.eq(returnValue)
    })

    it('calls roomPosition wizard', () => {
      sourceHandler.getPosition(0)
      expect(room.positionFromChar).to.be.calledOnceWithExactly(
        colonySources[0],
      )
    })
  })

  describe('#getDistance', () => {
    it('returns distance to source', () => {
      expect(sourceHandler.getDistance(0)).to.eq(123)
    })
  })

  describe('#free', () => {
    beforeEach(() => {
      Game.creeps[creepName] = {
        memory: {
          role: Role.MINER,
          room: '',
          deprivity: 0,
        } as CreepMemory,
        motherRoom: room,
      } as Creep
    })

    context('when there is free source', () => {
      it('returns free source id', () => {
        expect(sourceHandler.free).to.eq(1)
      })
    })

    context('when there is not free source', () => {
      let creepJohn: Creep
      beforeEach(() => {
        creepJohn = {
          memory: {
            role: Role.MINER,
            room: '',
            deprivity: 0,
          } as CreepMemory,
          motherRoom: room,
        } as Miner
        Game.creeps['John'] = creepJohn
      })

      it('returns -1', () => {
        expect(sourceHandler.free).to.eq(-1)
      })

      context('when there is not free source but some creep is retired', () => {
        beforeEach(() => {
          creepJohn.isRetired = true
        })

        it('returns that source', () => {
          expect(sourceHandler.free).to.eq(1)
        })
      })

      context(
        'when there is not free source but the creep is not coming from this room',
        () => {
          beforeEach(() => {
            creepJohn.motherRoom = { name: 'otherRoom' } as Room
          })

          it('returns that source', () => {
            expect(sourceHandler.free).to.eq(1)
          })
        },
      )
    })
  })

  describe('#positions', () => {
    const returnValue = 'position'
    beforeEach(() => {
      room.positionFromChar = sinon.stub().returns(returnValue)
    })

    context('when 2 values', () => {
      it('returns an array with two values', () => {
        expect(sourceHandler.positions).to.eql([returnValue, returnValue])
      })
    })

    context('when 1 value', () => {
      beforeEach(() => {
        delete colonySources[1]
      })

      it('calls position wizard with char', () => {
        sourceHandler.positions
        expect(room.positionFromChar).to.be.calledOnceWith(colonySources[0])
      })
    })
  })

  describe('#colonyPosition', () => {
    const returnValue = {}
    beforeEach(() => {
      sourceHandler.getPosition = sinon.stub().returns(returnValue)
    })

    it('returns colony source mining position', () => {
      expect(sourceHandler.colonyPosition).to.eql(returnValue)
    })

    it('calls #getPosition', () => {
      sourceHandler.colonyPosition
      expect(sourceHandler.getPosition).to.be.calledOnceWithExactly(
        room.memory[RoomMemoryKeys.colonySourceIndex],
      )
    })
  })
})
