import '../constants'
import 'overloads/all'
import { expect } from '../../expect'
import { isWalkable } from 'overloads/Structure'

describe('overloads/Structure#isWalkable', () => {
  let structure: Structure
  beforeEach(() => {
    structure = {} as Structure
  })
  ;[STRUCTURE_ROAD, STRUCTURE_CONTAINER].forEach((type) =>
    context(`when structure is ${type}`, () => {
      beforeEach(() => (structure.structureType = type))

      it('returns true', () => {
        expect(isWalkable(structure)).to.eq(true)
      })
    }),
  )

  context('when structure is quite other', () => {
    beforeEach(() => (structure.structureType = STRUCTURE_EXTENSION))

    it('returns false', () => {
      expect(isWalkable(structure)).to.eq(false)
    })
  })

  context('when structure is rampart', () => {
    beforeEach(() => (structure.structureType = STRUCTURE_RAMPART))

    it('returns false', () => {
      expect(isWalkable(structure)).to.eq(false)
    })

    context('when rampart is public', () => {
      beforeEach(() => ((structure as StructureRampart).isPublic = true))

      it('returns true', () => {
        expect(isWalkable(structure)).to.eq(true)
      })
    })

    context('when rampart is my', () => {
      beforeEach(() => ((structure as StructureRampart).my = true))

      it('returns true', () => {
        expect(isWalkable(structure)).to.eq(true)
      })
    })
  })
})
