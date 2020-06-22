import { expect } from 'chai';
import _ from 'lodash'
import sanitizeBody from 'utils/sanitizeBody';

describe('Body sanitizing for cpu effciency', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  describe('Single move part', () => {
    it('Should return the same array', () => {
      expect(sanitizeBody([MOVE])).to.eql([MOVE])
    })
  })

  describe('Should prioritize', () => {
    it('Should return the same array', () => {
      expect(sanitizeBody([MOVE, CARRY, WORK])).to.eql([CARRY, WORK, MOVE])
    })
  })

  describe('Should prioritize one', () => {
    it('Should return the same array', () => {
      expect(sanitizeBody([MOVE, MOVE, CARRY, WORK])).to.eql([MOVE, CARRY, WORK, MOVE])
    })
  })

  describe('Should not touch TOUGH part', () => {
    it('Should return the same array', () => {
      expect(sanitizeBody([TOUGH, MOVE, MOVE, CARRY, WORK])).to.eql([TOUGH, MOVE, CARRY, WORK, MOVE])
    })
  })
});
