import _ from 'lodash'
import { expect } from '../../expect'
import BoostManager from 'overloads/room/BoostManager'

describe('When lab system is in producing state', () => {
  let room: Room
  let lab: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.lab1 = {} as StructureLab
    room.lab2 = {} as StructureLab
    room.externalLabs = []
    room.memory = { labState: State.LAB_PRODUCING }
    room.cache = { labCooldown: 0, scoutsWorking: 0 }
    room.visual = new RoomVisual()
    lab = {} as StructureLab
    lab.shouldRunReaction = StructureLab.prototype.shouldRunReaction
  })

  it('allows running reaction while it is filled with the same mineral type', function () {
    lab.mineralType = RESOURCE_UTRIUM_HYDRIDE
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  })

  it('allows running reaction while there is no mineral', function () {
    const stubBoostData: BoostData = {
      labs: [
        [RESOURCE_UTRIUM_LEMERGITE, 300],
        [RESOURCE_GHODIUM_ALKALIDE, 0],
        [RESOURCE_UTRIUM_OXIDE, 200],
      ],
      creeps: [],
    }
    lab.room = {} as Room
    lab.room.boosts = stubBoostData as BoostManager
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  })

  it('allows running reaction while index is the same mineral', function () {
    const stubBoostData: BoostData = {
      labs: [
        [RESOURCE_UTRIUM_LEMERGITE, 300],
        [RESOURCE_UTRIUM_HYDRIDE, 1000],
        [RESOURCE_UTRIUM_OXIDE, 200],
      ],
      creeps: [],
    }
    lab.room = {} as Room
    lab.room.boosts = stubBoostData as BoostManager
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(true)
  })

  it('does not allow running reaction while index is not the same mineral', function () {
    const stubBoostData: BoostData = {
      labs: [
        [RESOURCE_UTRIUM_HYDRIDE, 100],
        [RESOURCE_UTRIUM_LEMERGITE, 100],
        [RESOURCE_UTRIUM_OXIDE, 300],
      ],
      creeps: [],
    }
    lab.room = {} as Room
    lab.room.boosts = stubBoostData as BoostManager
    expect(lab.shouldRunReaction(RESOURCE_UTRIUM_HYDRIDE, 1)).to.eql(false)
  })
})
