import './constants'
import 'overloads/all'
import _ from 'lodash'
import { loop } from '../../src/main'
import { Memory } from './mock'
import Game from './mock/Game'
import { assert } from '../expect'

describe('main', () => {
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

  it('should export a loop function', function () {
    assert.isTrue(typeof loop === 'function')
  })

  it('should return void when called with no context', function () {
    assert.isUndefined(loop())
  })
})
