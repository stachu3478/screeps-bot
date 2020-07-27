import _ from 'lodash'
import labJobs from 'job/lab';
import sinon from 'sinon'
import boostMock from '../../mock/boostData'
import { expect } from '../../../expect';

describe('Checking if lab is used for boosting and does further checks and requests', () => {
  const { lookForBoosting } = labJobs
  const lab = { id: 'lab' } as StructureLab
  const creep = {} as Creep
  let boostData: BoostData
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    boostData = boostMock()
    sinon.restore()
  });

  it('should return false for missing boost data', function () {
    expect(lookForBoosting(creep, [RESOURCE_GHODIUM_ACID, 0], lab)).to.eql(false)
  });

  it('should return true for matching amount and found fill job', function () {
    sinon.stub(labJobs, 'needsToBeFilledForBoosting').returns(true)
    sinon.stub(labJobs, 'prepareCreepForFilling').returns(true)
    expect(lookForBoosting(creep, [RESOURCE_UTRIUM_ACID, 300], lab)).to.eql(true)
    expect(labJobs.needsToBeFilledForBoosting).to.be.calledOnceWithExactly(lab, RESOURCE_UTRIUM_ACID, 300)
    expect(labJobs.prepareCreepForFilling).to.be.calledOnceWithExactly(creep, lab, RESOURCE_UTRIUM_ACID, 300)
  });

  it('should return true for matching index and amount and found dump job', function () {
    sinon.stub(labJobs, 'needsToBeFilledForBoosting').returns(false)
    sinon.stub(labJobs, 'prepareCreepForFilling').returns(false)
    sinon.stub(labJobs, 'needsToBeDumpedForBoosting').returns(true)
    sinon.stub(labJobs, 'prepareCreepForDumping')
    lab.mineralType = RESOURCE_UTRIUM_ACID
    expect(lookForBoosting(creep, [RESOURCE_UTRIUM_ACID, 300], lab)).to.eql(true)
    expect(labJobs.needsToBeFilledForBoosting).to.be.calledOnceWithExactly(lab, RESOURCE_UTRIUM_ACID, 300)
    expect(labJobs.prepareCreepForFilling).to.not.be.called
    expect(labJobs.needsToBeDumpedForBoosting).to.be.calledOnceWithExactly(lab, RESOURCE_UTRIUM_ACID)
    expect(labJobs.prepareCreepForDumping).to.be.calledOnceWithExactly(creep, 'lab', RESOURCE_UTRIUM_ACID)
  });

  it('should return false for job not found', function () {
    sinon.stub(labJobs, 'needsToBeFilledForBoosting').returns(false)
    sinon.stub(labJobs, 'needsToBeDumpedForBoosting').returns(false)
    sinon.stub(labJobs, 'prepareCreepForDumping')
    expect(lookForBoosting(creep, [RESOURCE_UTRIUM_ACID, 300], lab)).to.eql(false)
    expect(labJobs.needsToBeFilledForBoosting).to.be.calledOnceWithExactly(lab, RESOURCE_UTRIUM_ACID, 300)
    expect(labJobs.needsToBeDumpedForBoosting).to.be.calledOnceWithExactly(lab, RESOURCE_UTRIUM_ACID)
    expect(labJobs.prepareCreepForDumping).to.not.be.called
  });
});
