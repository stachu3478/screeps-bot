import _ from 'lodash'
import labJobs from 'job/lab';
import { expect } from '../../../expect';

describe('Checking if lab needs to be filled with boosting resources', () => {
  const { needsToBeFilledForBoosting } = labJobs
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it('should return false for sufficient resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ACID, store: { [RESOURCE_UTRIUM_ACID]: 300 } } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, 300)).to.eql(false)
  });

  it('should return false for different resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ALKALIDE, store: { [RESOURCE_UTRIUM_ALKALIDE]: 300 } } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, 300)).to.eql(false)
  });

  it('should return false for different insufficient resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ALKALIDE, store: { [RESOURCE_UTRIUM_ALKALIDE]: 150 } } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, 300)).to.eql(false)
  });

  it('should return true for no minerals', function () {
    const lab = { mineralType: null } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, 300)).to.eql(true)
  });

  it('should return true for insufficient minerals', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ACID, store: { [RESOURCE_UTRIUM_ACID]: 150 } } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, 300)).to.eql(true)
  });

  it('should return false for full lab', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ACID, store: { [RESOURCE_UTRIUM_ACID]: LAB_MINERAL_CAPACITY } } as StructureLab
    expect(needsToBeFilledForBoosting(lab, RESOURCE_UTRIUM_ACID, Infinity)).to.eql(false)
  });
});
