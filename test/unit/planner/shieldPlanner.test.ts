import '../constants'
import _ from 'lodash'
import { Memory } from '../mock'
import Game from '../mock/Game'
import RoomPosition from '../mock/RoomPosition'
import { expect } from '../../expect'
import ShieldPlanner from 'planner/shieldPlanner'
import { posToChar, roomPos } from 'planner/pos'

const room = {
  memory: { structs: '1234567890', roads: 'abcdefg' },
  positionFromChar: (c) => roomPos(c, 'myRoom'),
} as Room
describe('ShieldPlanner', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    // @ts-ignore : allow adding Memory to global
    global.RoomPosition = RoomPosition
  })

  it('room positions match those in memory', () => {
    const shieldPlanner = new ShieldPlanner(room)
    expect(shieldPlanner.roomPositions.map(posToChar).join('')).to.equal(
      room.memory[RoomMemoryKeys.shields],
    )
    expect(shieldPlanner.roomPositions).to.not.be.empty
  })
})
