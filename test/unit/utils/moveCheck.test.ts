import _ from 'lodash'
import sinon from 'sinon'
import move from 'utils/path/path'
import { expect } from '../../expect'

describe('Check for creep is moving', () => {
  let creep: Creep
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    creep = { memory: {} } as Creep
    sinon.restore()
  })

  describe('missing move data', () => {
    it('Should return false', () => {
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(false)
    })
  })

  describe('move time is less', () => {
    it('Should return false', () => {
      creep.memory._move = {
        path: '12345',
        dest: { x: 12, y: 35, room: 'W1N1' },
        t: Game.time - 2,
      }
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(false)
    })
  })

  describe('move time is last tick', () => {
    it('Should return true', () => {
      creep.memory._move = {
        path: '12345',
        dest: { x: 12, y: 35, room: 'W1N1' },
        t: Game.time - 1,
      }
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(true)
    })
  })
})
