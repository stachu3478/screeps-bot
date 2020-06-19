import { expect } from 'chai';
import _ from 'lodash'
import sinon from 'sinon'
import { handleTimers, Measurement } from 'utils/stats';

describe('Processing data for statistics', () => {
  let creep: Creep
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    sinon.restore()
  });

  describe('No stats data', () => {
    beforeEach(() => {
      delete Memory._stats
    })

    it('Should do nothing', () => {
      handleTimers(Memory._stats)
      expect(Memory._stats).to.be.undefined
    })
  })

  describe('Timer is not resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [0, 0, 0],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '', '', '']
        }
      }
    })

    it('Should do nothing', () => {
      handleTimers(Memory._stats)
      expect(Memory._stats).to.eql({
        timers: [1, 0, 0],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '', '', '']
        }
      })
    })
  })

  describe('Fake Timer is resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [9, 7, 3],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '', '', '']
        }
      }
    })

    it('Should not change data due to no retension mark', () => {
      handleTimers(Memory._stats)
      expect(Memory._stats).to.eql({
        timers: [0, 8, 3],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '', '', '']
        }
      })
    })
  })

  describe('Timer is resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [9, 9, 3],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '', '', '']
        }
      }
    })

    it('Should change data', () => {
      handleTimers(Memory._stats)
      expect(Memory._stats).to.eql({
        timers: [0, 0, 4],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '2', '', '']
        }
      })
    })
  })

  describe('More timers resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [9, 9, 9],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '123', '123', '']
        }
      }
    })

    it('Should change more data', () => {
      handleTimers(Memory._stats)
      expect(Memory._stats).to.eql({
        timers: [0, 0, 0],
        data: {
          [Measurement.CPU_INTERVAL]: ['123', '1232', '1232', '']
        }
      })
    })
  })
});
