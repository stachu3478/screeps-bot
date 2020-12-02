import './constants'
import 'overloads/all'
import _ from 'lodash'
import { addFirstRoom } from '../../src/main'
import { Memory } from './mock'
import { expect } from '../expect'

describe('addFirstRoom', () => {
  before(() => {
    // runs before all test in this block
  })

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = {}
    global.Game.rooms = { W14N15: {} as Room }
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  it('adds automatically room to myRooms if there are none in memory', () => {
    global.Memory.myRooms = {}
    addFirstRoom(global.Game, global.Memory)
    expect(global.Memory.myRooms.W14N15).to.not.be.undefined
  })

  it('does not add room to myRooms if there are some owned', () => {
    global.Memory.myRooms = { W15N14: 0 }
    addFirstRoom(global.Game, global.Memory)
    expect(global.Memory.myRooms.W14N15).to.be.undefined
  })
})
