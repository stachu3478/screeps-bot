import { expect } from 'chai';
import _ from 'lodash'
import lab from 'role/lab';
import State from 'constants/state';
import sinon from 'sinon';

describe('When lab system is in producing state', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    room = {} as Room
    room.lab1 = {} as StructureLab
    room.lab2 = {} as StructureLab
    room.externalLabs = []
    room.memory = { labState: State.LAB_PRODUCING, labCooldown: 0 }
    room.visual = new RoomVisual()
  });

  it('should switch to collecting state when no recipe is present', function () {
    lab(room)
    expect(room.memory.labState).to.eql(State.LAB_COLLECTING)
  });

  it('should run reaction', function () {
    room.memory.labRecipe = RESOURCE_UTRIUM_HYDRIDE
    const externalLab = {} as StructureLab
    externalLab.runReaction = sinon.stub().returns(OK)
    externalLab.shouldRunReaction = sinon.stub().returns(true)
    room.externalLabs.push(externalLab)
    lab(room)
    expect(externalLab.runReaction).to.be.calledOnce
    expect(room.memory.labState).to.eql(State.LAB_PRODUCING)
    expect(room.memory.labCooldown).to.be.greaterThan(0)
  });

  it('should run reaction and return to collecting state if no resources', function () {
    room.memory.labRecipe = RESOURCE_UTRIUM_HYDRIDE
    const externalLab = {} as StructureLab
    externalLab.runReaction = sinon.stub().returns(ERR_NOT_ENOUGH_RESOURCES)
    externalLab.shouldRunReaction = sinon.stub().returns(true)
    room.externalLabs.push(externalLab)
    lab(room)
    expect(externalLab.runReaction).to.be.calledOnce
    expect(room.memory.labState).to.eql(State.LAB_COLLECTING)
    expect(room.memory.labCooldown).to.eql(0)
  });

  it('should run reaction and return to collecting state if lab is full', function () {
    room.memory.labRecipe = RESOURCE_UTRIUM_HYDRIDE
    const externalLab = {} as StructureLab
    externalLab.runReaction = sinon.stub().returns(ERR_FULL)
    externalLab.shouldRunReaction = sinon.stub().returns(true)
    room.externalLabs.push(externalLab)
    lab(room)
    expect(externalLab.runReaction).to.be.calledOnce
    expect(room.memory.labState).to.eql(State.LAB_COLLECTING)
    expect(room.memory.labCooldown).to.eql(0)
  });

  it('should not run reaction and trigger cooldown', function () {
    room.memory.labRecipe = RESOURCE_UTRIUM_HYDRIDE
    const externalLab = {} as StructureLab
    externalLab.runReaction = sinon.stub().returns(OK)
    externalLab.shouldRunReaction = sinon.stub().returns(false)
    room.externalLabs.push(externalLab)
    lab(room)
    expect(externalLab.runReaction).to.not.be.called
    expect(room.memory.labState).to.eql(State.LAB_PRODUCING)
    expect(room.memory.labCooldown).to.be.greaterThan(0)
  });
});
