import _ from 'lodash'
import sinon from 'sinon'
import routineBooster from 'routine/boost'
import { NOTHING_DONE, FAILED, SUCCESS, NOTHING_TODO } from 'constants/response'
import { BoosterCreep } from 'role/creep/booster'
import move from 'utils/path'
import { expect } from '../../expect'

describe('Creep work in boost mode - routine', () => {
  let creep: BoosterCreep
  let lab1: StructureLab
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)

    lab1 = {} as StructureLab

    creep = { room: { memory: {}, cache: {} } } as BoosterCreep
    sinon.restore()
  })

  describe('no lab passed', () => {
    it('Should return nothing todo', () => {
      expect(routineBooster.run(creep, null)).to.eql(NOTHING_TODO)
      expect(creep.room.cache.priorityFilled).to.be.undefined
    })
  })

  describe('lab is distant', () => {
    beforeEach(() => {
      lab1.boostCreep = sinon.stub().returns(ERR_NOT_IN_RANGE)
      move.cheap = sinon.stub()
    })

    it('Should go towards lab', () => {
      expect(routineBooster.run(creep, lab1)).to.eql(NOTHING_DONE)
      expect(move.cheap).to.be.calledWithExactly(creep, lab1)
      expect(lab1.boostCreep).to.be.calledWithExactly(creep)
      expect(creep.room.cache.priorityFilled).to.be.undefined
    })
  })

  describe('lab failed to boost', () => {
    beforeEach(() => {
      lab1.boostCreep = sinon.stub().returns(ERR_NOT_OWNER)
    })

    it('should report failure', () => {
      expect(routineBooster.run(creep, lab1)).to.eql(FAILED)
      expect(lab1.boostCreep).to.be.calledWithExactly(creep)
      expect(creep.room.cache.priorityFilled).to.be.undefined
    })
  })

  describe('lab can boost creep', () => {
    beforeEach(() => {
      lab1.boostCreep = sinon.stub().returns(OK)
    })

    it('should report success', () => {
      expect(routineBooster.run(creep, lab1)).to.eql(SUCCESS)
      expect(lab1.boostCreep).to.be.calledWithExactly(creep)
      expect(creep.room.cache.priorityFilled).to.eql(0)
    })
  })
})
