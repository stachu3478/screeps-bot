import '../constants'
import _ from 'lodash'
import { Memory } from '../mock'
import Game from '../mock/Game'
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
  })

  xit('room positions match those in memory', () => {
    room.sources = {} as SourceHandler
    room.sources.colonyPosition = new RoomPosition(12, 34, 'test')
    const shieldPlanner = new ShieldPlanner(room)
    // test bundle patology
    expect(shieldPlanner.roomPositions.map(posToChar).join('')).to.equal(
      room.memory[RoomMemoryKeys.shields],
    )
    expect(shieldPlanner.roomPositions).to.not.be.empty
  })
})
