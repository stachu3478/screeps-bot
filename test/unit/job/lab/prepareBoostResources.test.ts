import _ from 'lodash'
import sinon from 'sinon'
import labJobs from 'job/lab';
import boostMock from '../../mock/boostData'
import { LabManager } from 'role/creep/labManager.d';
import { expect } from '../../../expect';

describe('Finding boost-preparing job', () => {
  const { prepareBoostResources } = labJobs
  let boostData: BoostData
  let creep: LabManager
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    boostData = boostMock()
    creep = { room: { getBoosts: () => boostData } } as LabManager
    lab = {} as StructureLab
    sinon.restore()
  });

  it('Returns false for no boost data', () => {
    sinon.stub(labJobs, 'lookForBoosting')
    expect(prepareBoostResources(creep, [lab])).to.eql(false)
    expect(labJobs.lookForBoosting).to.not.be.called
  })

  it('Returns false for no labs', () => {
    sinon.stub(labJobs, 'lookForBoosting')
    boostData.labs.push([RESOURCE_UTRIUM_ACID, 300])
    expect(prepareBoostResources(creep, [])).to.eql(false)
    expect(labJobs.lookForBoosting).to.not.be.called
  })

  it('Returns false if function did not found a job', () => {
    sinon.stub(labJobs, 'lookForBoosting').returns(false)
    boostData.labs.push([RESOURCE_UTRIUM_ACID, 300])
    expect(prepareBoostResources(creep, [lab])).to.eql(false)
    expect(labJobs.lookForBoosting).to.be.calledWithExactly(creep, [RESOURCE_UTRIUM_ACID, 300], lab)
  })

  it('Returns true if function has found a job', () => {
    sinon.stub(labJobs, 'lookForBoosting').returns(true)
    boostData.labs.push([RESOURCE_UTRIUM_ACID, 300])
    expect(prepareBoostResources(creep, [lab])).to.eql(true)
    expect(labJobs.lookForBoosting).to.be.calledWithExactly(creep, [RESOURCE_UTRIUM_ACID, 300], lab)
  })
});
