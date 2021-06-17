import utf15 from 'screeps-utf15'
import { expect } from '../expect'

describe('utf15', () => {
  it('should export a object', () => {
    expect(utf15).to.be.an('object')
  })

  it('should have property Coded', () => {
    expect(utf15.Codec).to.be.an('function')
  })
})
