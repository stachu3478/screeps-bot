import '../../constants'
import { expect } from '../../../expect'
import NukeVoyager from 'planner/military/NukeVoyager'

describe('NukeVoyager', () => {
  it('returns trivial 0 for no targets', () => {
    expect(new NukeVoyager([], 123).search()).to.eql(0)
  })

  it('returns trivial 1 for one target', () => {
    const targets = [
      {
        x: 15,
        y: 16,
        hits: 1700000000,
      },
    ]
    expect(new NukeVoyager(targets, 210).search()).to.eql(170)
  })

  it('returns non trivial 1 for two targets primary impact', () => {
    const targets = [
      {
        x: 15,
        y: 16,
        hits: 1,
      },
      {
        x: 15,
        y: 15,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(1)
  })

  it('returns non trivial 1 for two targets iterated impact', () => {
    const targets = [
      {
        x: 15,
        y: 16,
        hits: 1,
      },
      {
        x: 19,
        y: 13,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(1)
  })

  it('returns non trivial 1 for three targets iterated impact', () => {
    const targets = [
      {
        x: 15,
        y: 16,
        hits: 1,
      },
      {
        x: 18,
        y: 13,
        hits: 1,
      },
      {
        x: 14,
        y: 17,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(1)
  })

  it('returns non trivial 2 for three targets iterated impact', () => {
    const targets = [
      {
        x: 15,
        y: 16,
        hits: 1,
      },
      {
        x: 19,
        y: 13,
        hits: 1,
      },
      {
        x: 25,
        y: 35,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(2)
  })

  it('returns trivial 3 for three targets iterated impact', () => {
    const targets = [
      {
        x: 1,
        y: 1,
        hits: 1,
      },
      {
        x: 10,
        y: 10,
        hits: 1,
      },
      {
        x: 20,
        y: 20,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(3)
  })

  it('returns non trivial 2 for moduled center', () => {
    const targets = [
      {
        x: 12,
        y: 10,
        hits: 1,
      },
      {
        x: 10,
        y: 10,
        hits: 10000001,
      },
      {
        x: 8,
        y: 8,
        hits: 1,
      },
    ]
    expect(new NukeVoyager(targets, 5).search()).to.eql(2)
  })
})
