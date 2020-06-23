import '../../constants'
import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import roleBooster, { BoosterCreep } from 'role/creep/booster'
import routineBooster from 'routine/boost'
import State from 'constants/state';
import Role from 'constants/role';
import { NOTHING_DONE, FAILED, SUCCESS } from 'constants/response';

describe('Creep boost role', () => {
  let creep: BoosterCreep
  let lab1: StructureLab
  let lab2: StructureLab
  let externalLab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);

    lab1 = { mineralType: RESOURCE_UTRIUM_ACID } as StructureLab
    Game.getObjectById = () => (lab1)

    creep = { memory: { role: Role.BOOSTER, _targetRole: Role.MINER } } as BoosterCreep
    creep.room = {} as Room
    creep.room.externalLabs = [externalLab]
    creep.room.lab1 = lab1
    creep.room.lab2 = lab2
    creep.room.memory = {}
    creep.name = 'creepName'
    sinon.restore()
  });

  describe('no state specified', () => {
    describe('boost job found', () => {
      beforeEach(() => {
        creep.room.getBoostRequest = sinon.stub().returns('labId')
      })

      it('Should have default state BOOSTING', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.eql(State.BOOST)
        expect(creep.memory.role).to.eql(Role.BOOSTER)
        expect(creep.memory._boostLab).to.eql('labId')
        expect(creep.room.getBoostRequest).to.be.called
      })
    })

    describe('boost job not found', () => {
      beforeEach(() => {
        creep.room.getBoostRequest = sinon.stub().returns(undefined)
      })

      it('Should have default change role to target role', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(creep.memory.role).to.eql(Role.MINER)
        expect(creep.memory._targetRole).to.be.undefined
        expect(creep.memory._boostLab).to.be.undefined
        expect(creep.room.getBoostRequest).to.be.called
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

      it('Should run boost routine and keep boosting', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.eql(State.BOOST, 'Invalid state')
        expect(creep.memory.role).to.eql(Role.BOOSTER, 'Invalid role')
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
      })
    })

    describe('boosting done', () => {
      beforeEach(() => {
        sinon.stub(routineBooster, 'run').returns(SUCCESS)
        creep.room.clearBoostRequest = sinon.stub()
      })

      it('Should clear state', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(creep.memory.role).to.eql(Role.BOOSTER, 'Invalid role')
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
        expect(creep.room.clearBoostRequest).to.be.calledWithExactly(creep.name, lab1.mineralType)
      })
    })

    describe('boosting failed', () => {
      beforeEach(() => {
        sinon.stub(routineBooster, 'run').returns(FAILED)
        creep.room.clearBoostRequest = sinon.stub()
      })

      it('Should clear state', () => {
        roleBooster.run(creep)
        expect(creep.memory.state).to.be.undefined
        expect(routineBooster.run).to.be.calledWithExactly(creep, lab1)
        expect(creep.room.clearBoostRequest).to.be.calledWithExactly(creep.name, lab1.mineralType)
      })
    })
  })
});
