import _ from 'lodash'
import lab from 'role/lab'
import { expect } from '../../expect'
import roomCache from '../mock/RoomCache'

describe('Lab system initialization', () => {
  let room: Room
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    room = {} as Room
    room.lab1 = {} as StructureLab
    room.visual = new RoomVisual()
    room.cache = roomCache()
    room.memory = {}
  })

  it('does nothing if system is cooling down', () => {
    room.cache.labCooldown = 1
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.be.undefined
  })

  it('does nothing if main labs are missing', () => {
    lab(room)
    expect(room.memory.labState).to.be.undefined
  })

  it('returns to IDLE state if no more data are present', () => {
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.eql(State.IDLE)
  })

  it('returns to LAB_PRODUCING state if recipe is present', () => {
    room.memory = { labRecipe: RESOURCE_UTRIUM_HYDRIDE }
    room.lab2 = {} as StructureLab
    lab(room)
    expect(room.memory.labState).to.eql(State.LAB_PRODUCING)
  })
})
