import _ from 'lodash'
import sanitizeBody from 'utils/sanitizeBody';
import { expect } from '../../expect';

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

  describe('MOVE CARRY WORK', () => {
    it('Should prioritize', () => {
      expect(sanitizeBody([MOVE, CARRY, WORK])).to.eql([CARRY, WORK, MOVE])
    })
  })

  describe('More move parts', () => {
    it('Should prioritize one', () => {
      expect(sanitizeBody([MOVE, MOVE, CARRY, WORK])).to.eql([MOVE, CARRY, WORK, MOVE])
    })
  })

  describe('Contains TOUGH part', () => {
    it('Should not touch TOUGH part', () => {
      expect(sanitizeBody([TOUGH, MOVE, MOVE, CARRY, WORK])).to.eql([TOUGH, MOVE, CARRY, WORK, MOVE])
    })
  })

  describe('Move part already prioritized', () => {
    it('Should not prioritize WORK', () => {
      expect(sanitizeBody([CARRY, MOVE, CARRY, WORK, MOVE])).to.eql([CARRY, MOVE, CARRY, WORK, MOVE])
    })
  })
});
