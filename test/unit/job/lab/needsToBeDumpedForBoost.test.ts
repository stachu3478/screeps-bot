import { expect } from 'chai';
import _ from 'lodash'
import labJobs from 'job/lab';

describe('Checking if lab needs to be dumped out of resources for boosting', () => {
  const { needsToBeDumpedForBoosting } = labJobs
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it('should return false for sufficient resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ACID, store: { [RESOURCE_UTRIUM_ACID]: 300 } } as StructureLab
    expect(needsToBeDumpedForBoosting(lab, RESOURCE_UTRIUM_ACID)).to.eql(false)
  });

  it('should return true for different resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ALKALIDE, store: { [RESOURCE_UTRIUM_ALKALIDE]: 300 } } as StructureLab
    expect(needsToBeDumpedForBoosting(lab, RESOURCE_UTRIUM_ACID)).to.eql(true)
  });

  it('should return true for different insufficient resources', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ALKALIDE, store: { [RESOURCE_UTRIUM_ALKALIDE]: 150 } } as StructureLab
    expect(needsToBeDumpedForBoosting(lab, RESOURCE_UTRIUM_ACID)).to.eql(true)
  });

  it('should return false for no minerals', function () {
    const lab = { mineralType: null } as StructureLab
    expect(needsToBeDumpedForBoosting(lab, RESOURCE_UTRIUM_ACID)).to.eql(false)
  });

  it('should return false for insufficient minerals', function () {
    const lab = { mineralType: RESOURCE_UTRIUM_ACID, store: { [RESOURCE_UTRIUM_ACID]: 150 } } as StructureLab
    expect(needsToBeDumpedForBoosting(lab, RESOURCE_UTRIUM_ACID)).to.eql(false)
  });
});
