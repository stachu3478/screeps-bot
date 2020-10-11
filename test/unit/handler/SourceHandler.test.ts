import '../constants'
import 'overloads/all'
import sinon from 'sinon'
import { expect } from '../../expect'
import SourceHandler from 'handler/SourceHandler'
import xyToChar, { roomPos } from 'planner/pos'
import { Miner } from 'role/creep/miner'
import Game from '../mock/Game'

const sourcePosition = String.fromCharCode(xyToChar(12, 34))
const sourceDistance = String.fromCharCode(123)
const creepName = 'creepName'
let colonySources: SourceMap
let room: Room
let sourceHandler: SourceHandler
describe('SourceHandler', () => {
  beforeEach(() => {
    colonySources = {
      test: `${sourcePosition}${sourceDistance}${creepName}`,
      test2: '12John',
    }
    room = {
      memory: { colonySources, colonySourceId: 'test2' } as RoomMemory,
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
        sourceHandler.assign('newCreepName', 'test')
      })

      it('overwrites creep name part', () => {
        expect(colonySources['test']).to.eq(
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
      expect(sourceHandler.getPosition('test')).to.eq(returnValue)
    })

    it('calls roomPosition wizard', () => {
      sourceHandler.getPosition('test')
      expect(room.positionFromChar).to.be.calledOnceWithExactly(
        colonySources['test'],
      )
    })
  })

  describe('#getDistance', () => {
    it('returns distance to source', () => {
      expect(sourceHandler.getDistance('test')).to.eq(123)
    })
  })

  describe('#free', () => {
    beforeEach(() => {
      Game.creeps[creepName] = {
        memory: {
          _harvest: 'test',
          role: Role.MINER,
          room: '',
          deprivity: 0,
        } as CreepMemory,
      } as Creep
    })

    context('when there is free source', () => {
      it('returns free source id', () => {
        expect(sourceHandler.free).to.eq('test2')
      })
    })

    context('when there is not free source', () => {
      const creepJohn = {
        memory: {
          _harvest: 'test2',
          role: Role.MINER,
          room: '',
          deprivity: 0,
        } as CreepMemory,
      } as Miner
      beforeEach(() => {
        Game.creeps['John'] = creepJohn
      })

      it('returns undefined', () => {
        expect(sourceHandler.free).to.be.undefined
      })

      context('when there is not free source but some creep is retired', () => {
        beforeEach(() => {
          creepJohn.isRetired = true
        })

        it('returns that source', () => {
          expect(sourceHandler.free).to.eq('test2')
        })
      })

      context(
        'when there is not free source but some creep not mining exaclty what declared',
        () => {
          beforeEach(() => {
            creepJohn.memory._harvest = 'someOther' as Id<Source>
          })

          it('returns that source', () => {
            expect(sourceHandler.free).to.eq('test2')
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
        delete colonySources['test2']
      })

      it('calls position wizard with char', () => {
        sourceHandler.positions
        expect(room.positionFromChar).to.be.calledOnceWith(
          colonySources['test'],
        )
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
        room.memory.colonySourceId,
      )
    })
  })
})
