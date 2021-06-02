import '../constants'
import {
  progressiveClaimer,
  progressiveCommander,
} from '../../../src/spawn/body/body'
import {
  progressiveWorker,
  progressiveMobileWorker,
  progressiveDepositMiner,
} from '../../../src/spawn/body/work'
import { Memory } from '../mock'
import Game from '../mock/Game'
import { assert, expect } from '../../expect'

describe('spawn/body', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  it('returns array when called with no context', () => {
    assert.isArray(progressiveWorker(1000))
  })

  it('returns minimalist worker', () => {
    const result = progressiveWorker(0)
    assert.includeMembers(result, [WORK, MOVE, CARRY])
    assert.lengthOf(result, 3)
  })

  it('returns bigger worker', () => {
    const result = progressiveWorker(300)
    assert.includeMembers(result, [WORK, MOVE, CARRY])
    assert.isAtLeast(result.length, 4)
  })

  it('returns even bigger worker', () => {
    assert.notDeepEqual(progressiveWorker(300), progressiveWorker(350))
  })

  it('returns array when called with no context', () => {
    assert.isArray(progressiveCommander(1000, 1))
  })

  it('returns commander with at least 1 per MOVE, HEAL, TOUGH, ATTACK parts', () => {
    const result = progressiveCommander(0, 1)
    assert.includeMembers(result, [MOVE, HEAL, TOUGH, ATTACK])
    assert.lengthOf(result, 6)
  })

  it('returns bigger commander', () => {
    const result = progressiveCommander(0, 2)
    assert.includeMembers(result, [MOVE, HEAL, TOUGH, ATTACK])
    assert.isAtLeast(result.length, 10)
  })

  it('returns as many heal parts as possible', () => {
    const result = progressiveCommander(
      10 * (BODYPART_COST[HEAL] + BODYPART_COST[MOVE]),
      0,
    )
    assert.includeMembers(result, [MOVE, HEAL])
    assert.equal(result.length, 20)
    assert.equal(result.filter((p) => p === HEAL).length, 10)
  })

  it('returns commander maxed out', () => {
    const result = progressiveCommander(1000000, 2)
    assert.equal(result.length, MAX_CREEP_SIZE)
  })

  it('returns progressive mobile worker', () => {
    const testMax = SPAWN_ENERGY_START * 10
    for (let e = SPAWN_ENERGY_START; e < testMax; e += 50) {
      const result = progressiveMobileWorker(e)
      const energy = result.reduce((c, p) => c + BODYPART_COST[p], 0)
      assert.isAtMost(energy, e)
    }
  })

  it('returns minimalist claimer', () => {
    expect(progressiveClaimer(699, 0, 50)).to.eql([CLAIM, MOVE])
  })

  it('returns claimer with 1 heal part from missing energy', () => {
    expect(progressiveClaimer(1000, 2, 50)).to.eql([
      CLAIM,
      MOVE,
      MOVE,
      HEAL,
      MOVE,
    ])
  })

  it('returns claimer with 2 heal parts', () => {
    expect(progressiveClaimer(1300, 2, 50)).to.eql([
      CLAIM,
      MOVE,
      MOVE,
      HEAL,
      MOVE,
      HEAL,
      MOVE,
    ])
  })

  it('returns maxed claimer', () => {
    expect(progressiveClaimer(100000, 200, 50)).to.have.lengthOf(50)
  })

  it('returns balanced deposit miner', () => {
    const body = progressiveDepositMiner(100000, 200, 50)
    expect(body).to.have.lengthOf(50)
    expect(body).to.include(WORK)
    expect(body).to.include(CARRY)
    expect(body.filter((p) => p === MOVE)).to.have.lengthOf(25)
  })
})
