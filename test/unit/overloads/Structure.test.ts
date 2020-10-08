import '../constants'
import 'overloads/all'
import { expect } from '../../expect'

describe('overloads/Structure#isWalkable', () => {
  let structure: Structure
  beforeEach(() => {
    structure = new Structure('test' as Id<Structure>)
  })
  ;[STRUCTURE_ROAD, STRUCTURE_CONTAINER].forEach((type) =>
    context(`when structure is ${type}`, () => {
      beforeEach(() => (structure.structureType = type))

      it('returns true', () => {
        expect(structure.isWalkable).to.eq(true)
      })
    }),
  )

  context('when structure is quite other', () => {
    beforeEach(() => (structure.structureType = STRUCTURE_EXTENSION))

    it('returns false', () => {
      expect(structure.isWalkable).to.eq(false)
    })
  })

  context('when structure is rampart', () => {
    beforeEach(() => (structure.structureType = STRUCTURE_RAMPART))

    it('returns false', () => {
      expect(structure.isWalkable).to.eq(false)
    })

    context('when rampart is public', () => {
      beforeEach(() => ((structure as StructureRampart).isPublic = true))

      it('returns true', () => {
        expect(structure.isWalkable).to.eq(true)
      })
    })

    context('when rampart is my', () => {
      beforeEach(() => ((structure as StructureRampart).my = true))

      it('returns true', () => {
        expect(structure.isWalkable).to.eq(true)
      })
    })
  })
})
