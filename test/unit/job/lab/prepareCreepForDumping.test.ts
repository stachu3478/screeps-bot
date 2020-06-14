import { expect } from 'chai';
import _ from 'lodash'
import labJobs from 'job/lab';
import { LabManager } from 'role/creep/labManager.d';
import { HAUL_STORAGE_FROM_LAB } from 'constants/state';

describe('Preparing creep to empty lab', () => {
  const { prepareCreepForDumping } = labJobs
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it('should target creep to empty given lab', function () {
    const creep = { memory: {}, store: { getFreeCapacity: () => Infinity } } as LabManager
    prepareCreepForDumping(creep, 'theLab' as Id<StructureLab>, RESOURCE_UTRIUM_ACID)
    expect(creep.memory._draw).to.eql('theLab', 'Invalid draw target id')
    expect(creep.memory._drawType).to.eql(RESOURCE_UTRIUM_ACID, 'Invalid resource type to draw from')
    expect(creep.memory._fillType).to.eql(RESOURCE_UTRIUM_ACID, 'Invalid resource type to insert to')
    expect(creep.memory.state).to.eql(HAUL_STORAGE_FROM_LAB, 'Invalid state selected')
  });
});