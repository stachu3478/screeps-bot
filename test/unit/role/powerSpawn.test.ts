import '../constants'
import _ from 'lodash'
import sinon from 'sinon'
import rolePowerSpawn from 'role/powerSpawn'
import { expect } from '../../expect'

describe('Role of the power spawn', () => {
  let room: Room
  let powerSpawn: StructurePowerSpawn
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)

    powerSpawn = { cache: {} } as StructurePowerSpawn
    room = { memory: {}, cache: {}, buildings: { powerSpawn } } as Room
    powerSpawn.room = room

    sinon.restore()
  })

  describe('no state specified or 0', () => {
    describe('no errors with power processing', () => {
      beforeEach(() => {
        powerSpawn.processPower = sinon.stub().returns(OK)
      })

      it('Should be on by default', () => {
        rolePowerSpawn(powerSpawn)
        expect(powerSpawn.processPower).to.be.called
        expect(powerSpawn.cache.idle).to.be.undefined
      })
    })

    describe('errors with power processing', () => {
      beforeEach(() => {
        powerSpawn.processPower = sinon.stub().returns(ERR_NOT_ENOUGH_RESOURCES)
      })

      it('Should be off by default', () => {
        rolePowerSpawn(powerSpawn)
        expect(powerSpawn.processPower).to.be.called
        expect(powerSpawn.cache.idle).to.eql(1)
      })
    })
  })

  describe('idle state', () => {
    beforeEach(() => {
      powerSpawn.cache.idle = 1
    })

    it('Should not do anything', () => {
      rolePowerSpawn(powerSpawn)
      expect(powerSpawn.cache.idle).to.eql(1)
    })
  })
})
