import '../constants'
import _ from 'lodash'
import sinon from 'sinon'
import rolePowerSpawn from 'role/powerSpawn'
import { expect } from '../../expect';

describe('Creep boost role', () => {
  let room: Room
  let powerSpawn: StructurePowerSpawn
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);

    powerSpawn = {} as StructurePowerSpawn
    room = { memory: {}, powerSpawn: powerSpawn } as Room
    powerSpawn.room = room

    sinon.restore()
  });

  describe('no state specified or 0', () => {
    describe('no errors with power processing', () => {
      beforeEach(() => {
        powerSpawn.processPower = sinon.stub().returns(OK)
      })

      it('Should be on by default', () => {
        rolePowerSpawn(powerSpawn)
        expect(powerSpawn.processPower).to.be.called
        expect(room.memory[Keys.powerSpawnIdle]).to.be.undefined
      })
    })

    describe('errors with power processing', () => {
      beforeEach(() => {
        powerSpawn.processPower = sinon.stub().returns(ERR_NOT_ENOUGH_RESOURCES)
      })

      it('Should be off by default', () => {
        rolePowerSpawn(powerSpawn)
        expect(powerSpawn.processPower).to.be.called
        expect(room.memory[Keys.powerSpawnIdle]).to.eql(1)
        expect(room.memory.priorityFilled).to.eql(0)
      })
    })
  })

  describe('idle state', () => {
    beforeEach(() => {
      room.memory[Keys.powerSpawnIdle] = 1
    })

    it('Should not do anything', () => {
      rolePowerSpawn(powerSpawn)
      expect(room.memory[Keys.powerSpawnIdle]).to.eql(1)
    })
  })
});
