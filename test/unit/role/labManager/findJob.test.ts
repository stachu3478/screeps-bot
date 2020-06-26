import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import labJobs from 'job/lab';
import handleLab from 'utils/handleLab';
import { findJob } from 'role/creep/labManager'

describe('Finding job for lab manager', () => {
  let creep: Creep
  let lab1: StructureLab
  let lab2: StructureLab
  let externalLab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);

    lab1 = {} as StructureLab
    lab2 = {} as StructureLab
    externalLab = {} as StructureLab

    creep = { memory: {} } as Creep
    creep.room = {} as Room
    creep.room.externalLabs = [externalLab]
    creep.room.lab1 = lab1
    creep.room.lab2 = lab2
    creep.room.terminal = {} as StructureTerminal
    creep.room.memory = {}
    sinon.restore()
  });

  it('Returns true if boost job found', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(true)
    delete creep.room.lab1
    expect(findJob(creep)).to.eql(true)
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns false for no main labs', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'prepareReaction')
    delete creep.room.lab1
    expect(findJob(creep)).to.eql(false)
    expect(creep.memory.state).to.eql(State.IDLE)
    expect(labJobs.prepareReaction).to.not.be.called
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns false for no terminal', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'prepareReaction')
    delete creep.room.terminal
    expect(findJob(creep)).to.eql(false)
    expect(creep.memory.state).to.eql(State.IDLE)
    expect(labJobs.prepareReaction).to.not.be.called
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns false for lab state pending and no such job', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'prepareReaction').returns(false)
    creep.room.memory.labState = State.LAB_PENDING
    expect(findJob(creep)).to.eql(false)
    expect(creep.memory.state).to.eql(State.IDLE)
    expect(labJobs.prepareReaction).to.be.calledWithExactly(lab1, lab2, creep.room.terminal, creep.room.memory, creep)
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns true for lab state pending and found job', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'prepareReaction').returns(true)
    creep.room.memory.labState = State.LAB_PENDING
    expect(findJob(creep)).to.eql(true)
    expect(labJobs.prepareReaction).to.be.calledWithExactly(lab1, lab2, creep.room.terminal, creep.room.memory, creep)
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns false for lab state collecting and no such job', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'collectResources').returns(false)
    sinon.stub(handleLab, 'run')
    creep.room.memory.labState = State.LAB_COLLECTING
    expect(findJob(creep)).to.eql(false)
    expect(creep.memory.state).to.eql(State.IDLE)
    expect(creep.room.memory.labState).to.eql(State.IDLE)
    expect(labJobs.collectResources).to.be.calledWithExactly(creep, [externalLab, lab1, lab2])
    expect(handleLab.run).to.be.calledWithExactly(creep.room.terminal)
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })

  it('Returns true for lab state collecting and found job', () => {
    sinon.stub(labJobs, 'prepareBoostResources').returns(false)
    sinon.stub(labJobs, 'collectResources').returns(true)
    sinon.stub(handleLab, 'run')
    creep.room.memory.labState = State.LAB_COLLECTING
    expect(findJob(creep)).to.eql(true)
    expect(creep.room.memory.labState).to.eql(State.LAB_COLLECTING)
    expect(labJobs.collectResources).to.be.calledWithExactly(creep, [externalLab, lab1, lab2])
    expect(handleLab.run).to.not.be.called
    expect(labJobs.prepareBoostResources).to.be.calledWithExactly(creep, creep.room.externalLabs)
  })
});
