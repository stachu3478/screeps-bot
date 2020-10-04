import '../constants'
import _ from 'lodash'
import harvest from '../../../src/routine/work/harvest'
import { Memory } from '../mock'
import Game from '../mock/Game'
import Harvester from 'role/creep/harvester.d'
import { assert } from '../../expect'

describe('routine/harvest', () => {
  before(() => {
    // runs before all test in this block
  })

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  it('should export a loop function', () => {
    assert.isTrue(typeof harvest === 'function')
  })

  it('should return number when called with no context', () => {
    assert.isNumber(
      harvest({
        store: { getFreeCapacity: () => 50 },
        memory: {} as CreepMemory,
        pos: {
          findClosestByPath: (CNST: FindConstant) => null,
        },
      } as Harvester),
    )
  })
})
