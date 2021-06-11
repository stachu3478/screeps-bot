import { expect } from '../../expect'
import DefencePolicy from 'room/DefencePolicy'

let room: Room
describe('room/DefencePolicy', () => {
  beforeEach(() => {
    room = { memory: {} } as Room
  })

  it('returns true by default when can deal damage', () => {
    const policy = new DefencePolicy(room)
    expect(policy.shouldAttack(true)).to.be.true
  })

  it('returns false by default when cannnot deal damage', () => {
    const policy = new DefencePolicy(room)
    expect(policy.shouldAttack(false)).to.be.false
  })

  it('returns false when once deal and once not deal', () => {
    const policy = new DefencePolicy(room)
    policy.shouldAttack(true)
    policy.shouldAttack(false)
    expect(policy.shouldAttack(true)).to.be.false
  })

  it('returns false when once deal and once not deal cached', () => {
    room.memory = { d: 1, D: 0 }
    const policy = new DefencePolicy(room)
    expect(policy.shouldAttack(true)).to.be.false
  })

  it('does not remember anything after reset', () => {
    room.memory = { d: 1, D: 0 }
    const policy = new DefencePolicy(room)
    policy.reset()
    expect(policy.shouldAttack(true)).to.be.true
  })
})
