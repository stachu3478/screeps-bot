import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import move from 'utils/path';

describe('Creep work in boost mode', () => {
  let creep: Creep
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    creep = { memory: {} } as Creep
    sinon.restore()
  });

  describe('missing move data', () => {
    it('Should return false', () => {
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(false)
    })
  })

  describe('equal positions', () => {
    describe('matching dest object', () => {
      it('Should return false', () => {
        creep.memory._move = { path: '12345', dest: { x: 12, y: 34, room: 'W1N1' } }
        creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
        expect(move.check(creep)).to.eql(false)
      })
    })

    describe('mathing path position only', () => {
      it('Should return true', () => {
        creep.memory._move = { path: '12345', dest: { x: 12, y: 35, room: 'W1N1' } }
        creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
        expect(move.check(creep)).to.eql(false)
      })
    })
  })

  describe('not equal positions', () => {
    it('Should return true', () => {
      creep.memory._move = { path: '123567', dest: { x: 12, y: 35, room: 'W1N1' } }
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(true)
    })

    it('Should return false', () => {
      creep.memory._move = { path: '12356', dest: { x: 13, y: 34, room: 'W1N1' } }
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(false)
    })

    it('Should return true', () => {
      creep.memory._move = { path: '123567', dest: { x: 13, y: 35, room: 'W1N1' } }
      creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
      expect(move.check(creep)).to.eql(true)
    })

    describe('not equal rooms', () => {
      it('Should return true', () => {
        creep.memory._move = { path: '1235', dest: { x: 12, y: 34, room: 'W1N2' } }
        creep.pos = { x: 12, y: 34, roomName: 'W1N1' } as RoomPosition
        expect(move.check(creep)).to.eql(true)
      })
    })
  })
});
