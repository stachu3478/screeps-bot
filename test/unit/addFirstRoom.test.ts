import './constants'
import 'overloads/all'
import _ from 'lodash'
import { Memory } from './mock'
import { expect } from '../expect'
import MyRooms from 'room/MyRooms'

describe('addFirstRoom', () => {
  before(() => {
    // runs before all test in this block
  })

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = {}
    global.Game.rooms = { W14N15: { name: 'W14N15' } as Room }
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  it('adds automatically room to myRooms if there are none in memory', () => {
    MyRooms.addFirst(global.Game, global.Memory)
    expect(global.Memory.myRooms).to.eql({ W14N15: 0 })
  })

  it('does not add room to myRooms if there are some owned', () => {
    global.Memory.myRooms = { W15N14: 0 }
    MyRooms.addFirst(global.Game, global.Memory)
    expect(global.Memory.myRooms).to.eql({ W15N14: 0 })
  })
})
