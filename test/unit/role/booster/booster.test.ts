import '../../constants'
import _ from 'lodash'
import sinon from 'sinon'
import roleBooster, { BoosterCreep } from 'role/creep/booster'
import routineBooster from 'routine/boost'
import { NOTHING_DONE, FAILED, SUCCESS } from 'constants/response'
import { expect } from '../../../expect'

describe('Creep boost role', () => {
  let creep: BoosterCreep
  let lab1: StructureLab
  let lab2: StructureLab
  let externalLab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)

    lab1 = { mineralType: RESOURCE_UTRIUM_ACID } as StructureLab
    Game.getObjectById = () => lab1

    creep = {
      memory: { role: Role.BOOSTER, newRole: Role.MINER },
    } as BoosterCreep
    creep.room = {} as Room
    creep.room.boosts = {} as BoostManager
    creep.room.boosts.hasMandatory = () => false
    creep.room.externalLabs = [externalLab]
    creep.room.lab1 = lab1
    creep.room.lab2 = lab2
    creep.room.memory = {}
    creep.name = 'creepName'
    sinon.restore()
  })

  describe('no state specified', () => {
    describe('boost job found', () => {
      beforeEach(() => {
        creep.room.boosts.getRequest = sinon.stub().returns('labId')
      })

      it('states to BOOSTING', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.eql(State.BOOST)
        expect(creep.memory.role).to.eql(Role.BOOSTER)
        expect(creep.memory._boostLab).to.eql('labId')
        expect(creep.room.boosts.getRequest).to.be.called
      })
    })

    describe('boost job not found', () => {
      beforeEach(() => {
        creep.room.boosts.getRequest = sinon.stub().returns(undefined)
      })

      it('changes role to target role', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(creep.memory.role).to.eql(Role.MINER)
        expect(creep.memory.newRole).to.be.undefined
        expect(creep.memory._boostLab).to.be.undefined
        expect(creep.room.boosts.getRequest).to.be.called
      })
    })
  })

  describe('boosting state', () => {
    beforeEach(() => {
      creep.memory.state = State.BOOST
      creep.memory._boostLab = 'labId' as Id<StructureLab>
    })

    describe('boosting in progress', () => {
      beforeEach(() => {
        sinon.stub(routineBooster, 'run').returns(NOTHING_DONE)
      })

      it('runs boost routine and keep boosting', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.eql(State.BOOST, 'Invalid state')
        expect(creep.memory.role).to.eql(Role.BOOSTER, 'Invalid role')
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
      })
    })

    describe('boosting done', () => {
      beforeEach(() => {
        sinon.stub(routineBooster, 'run').returns(SUCCESS)
        creep.room.boosts.clearRequests = sinon.stub()
      })

      it('clears state', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(creep.memory.role).to.eql(Role.BOOSTER, 'Invalid role')
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
        expect(creep.room.boosts.clearRequests).to.be.calledWithExactly(
          creep.name,
          lab1.mineralType,
          true,
        )
      })
    })

    describe('boosting failed', () => {
      beforeEach(() => {
        sinon.stub(routineBooster, 'run').returns(FAILED)
        creep.room.boosts.clearRequests = sinon.stub()
      })

      it('Should clear state', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
        expect(creep.room.boosts.clearRequests).to.be.calledWithExactly(
          creep.name,
          lab1.mineralType,
          false,
        )
      })
    })
  })
})
