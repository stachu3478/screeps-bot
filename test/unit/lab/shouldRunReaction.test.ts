import { expect } from 'chai';
import _ from 'lodash'
import State from 'constants/state';

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

  it('should allow running reaction while it is filled with the same mineral type', function () {
    const lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
    lab.mineralType = RESOURCE_UTRIUM_HYDRIDE
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  });

  it('should allow running reaction while index not contains data', function () {
    const lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
    const stubBoostData = {} as BoostData
    stubBoostData.resources = { labs: [RESOURCE_UTRIUM_LEMERGITE, , RESOURCE_UTRIUM_OXIDE], creeps: [] }
    lab.room = { getBoosts: () => stubBoostData } as Room
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  });

  it('should allow running reaction while index is the same mineral', function () {
    const lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
    const stubBoostData = {} as BoostData
    stubBoostData.resources = { labs: [RESOURCE_UTRIUM_LEMERGITE, RESOURCE_UTRIUM_HYDRIDE, RESOURCE_UTRIUM_OXIDE], creeps: [] }
    lab.room = { getBoosts: () => stubBoostData } as Room
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  });

  it('should not allow running reaction while index is not the same mineral', function () {
    const lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
    const stubBoostData = {} as BoostData
    stubBoostData.resources = { labs: [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_UTRIUM_LEMERGITE, RESOURCE_UTRIUM_OXIDE], creeps: [] }
    stubBoostData.amounts = { labs: [100, 100, 300], creeps: [] }
    lab.room = { getBoosts: () => stubBoostData } as Room
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(false)
  });

  it('should allow running reaction while there is no mineral', function () {
    const lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
    const stubBoostData = {} as BoostData
    stubBoostData.resources = { labs: [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_UTRIUM_LEMERGITE, RESOURCE_UTRIUM_OXIDE], creeps: [] }
    stubBoostData.amounts = { labs: [100, 0, 300], creeps: [] }
    lab.room = { getBoosts: () => stubBoostData } as Room
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  });
});
