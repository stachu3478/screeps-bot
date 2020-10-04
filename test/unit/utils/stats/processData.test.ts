import _ from 'lodash'
import sinon from 'sinon'
import { processData, Measurement } from 'utils/stats'
import { expect } from '../../../expect'

describe('Processing data for statistics - processing tick', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
    sinon.restore()
  })

  describe('No stats data', () => {
    beforeEach(() => {
      delete Memory._stats
    })

    it('Should return true', () => {
      expect(processData(Measurement.CPU_INTERVAL)).to.eql(true)
      expect(Memory._stats).to.eql({
        timers: [0, 0, 0],
        data: {
          [Measurement.CPU_INTERVAL]: ['\0', '', '', ''],
        },
      })
    })
  })

  describe('Timer is not resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [0, 0, 0],
        data: {},
      }
    })

    describe('Data length not enough to truncate', () => {
      beforeEach(() => {
        ;(Memory._stats as Stats).data[Measurement.CPU_INTERVAL] = [
          '123',
          '',
          '',
          '',
        ]
      })

      it('Should return true', () => {
        expect(processData(Measurement.CPU_INTERVAL)).to.eql(true)
        expect(Memory._stats).to.eql({
          timers: [0, 0, 0],
          data: {
            [Measurement.CPU_INTERVAL]: ['123\0', '', '', ''],
          },
        })
      })
    })

    describe('Data need to be truncated', () => {
      beforeEach(() => {
        ;(Memory._stats as Stats).data[Measurement.CPU_INTERVAL] = [
          '12'.repeat(50),
          '',
          '',
          '',
        ]
      })

      it('Should return true', () => {
        expect(processData(Measurement.CPU_INTERVAL)).to.eql(true)
        expect(Memory._stats).to.eql({
          timers: [0, 0, 0],
          data: {
            [Measurement.CPU_INTERVAL]: [
              '12'.repeat(50).slice(1) + '\0',
              '',
              '',
              '',
            ],
          },
        })
      })
    })
  })

  describe('Timer is resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [9, 9, 3],
        data: {},
      }
    })

    it('Should change data', () => {
      expect(processData(Measurement.CPU_INTERVAL)).to.eql(true)
      expect(Memory._stats).to.eql({
        timers: [9, 9, 3],
        data: {
          [Measurement.CPU_INTERVAL]: ['\0', '', '', ''],
        },
      })
    })
  })

  describe('More timers resetting', () => {
    beforeEach(() => {
      Memory._stats = {
        timers: [9, 9, 9],
        data: {},
      }
    })

    it('Should return true', () => {
      expect(processData(Measurement.CPU_INTERVAL)).to.eql(true)
      expect(Memory._stats).to.eql({
        timers: [9, 9, 9],
        data: {
          [Measurement.CPU_INTERVAL]: ['\0', '', '', ''],
        },
      })
    })
  })
})
