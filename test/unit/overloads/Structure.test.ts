import '../constants'
import 'overloads/all'
import { expect } from '../../expect'
import Game from '../mock/Game'

describe('overloads/Structure#isWalkable', () => {
  let structure: Structure
  beforeEach(() => {
    structure = new Structure('test' as Id<Structure>)
    structure.pos = {} as RoomPosition
    structure.pos.building = () => undefined
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    global.Game.creeps['some'] = { owner: { username: 'Me' } } as Creep
  })

  describe('#isWalkable', () => {
    ;[STRUCTURE_ROAD, STRUCTURE_CONTAINER].forEach((type) =>
      context(`when structure is ${type}`, () => {
        beforeEach(() => (structure.structureType = type))

        it('returns true', () => {
          expect(structure.isWalkable).to.eq(true)
        })
      }),
    )

    context('when structure is quite other', () => {
      beforeEach(() => {
        structure.structureType = STRUCTURE_EXTENSION
      })

      it('returns false', () => {
        expect(structure.isWalkable).to.eq(false)
      })
    })

    context('when structure is rampart', () => {
      beforeEach(() => {
        structure = new OwnedStructure('test' as Id<OwnedStructure>)
        structure.pos = {} as RoomPosition
        structure.pos.building = () => undefined
        structure.room = { my: false } as Room
        structure.structureType = STRUCTURE_RAMPART
      })

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
        beforeEach(() => (structure.room = { my: true } as Room))

        it('returns true', () => {
          expect(structure.isWalkable).to.eq(true)
        })
      })
    })
  })

  describe('effectiveHits', () => {
    context('when structure is not hittable', () => {
      it('returns 0', () => {
        expect(structure.effectiveHits).to.eq(0)
      })
    })

    context('when structure is hittable', () => {
      beforeEach(() => {
        structure.hits = 123
      })

      context('when structure is quite other', () => {
        beforeEach(() => (structure.structureType = STRUCTURE_EXTENSION))

        it('returns its hits', () => {
          expect(structure.effectiveHits).to.eq(123)
        })

        context('when structure is rampart', () => {
          beforeEach(() => (structure.structureType = STRUCTURE_RAMPART))

          it('returns its hits', () => {
            expect(structure.effectiveHits).to.eq(123)
          })
        })
      })

      context('when structure is protected by rampart', () => {
        beforeEach(() => {
          const rampart = {} as StructureRampart
          rampart.structureType = STRUCTURE_RAMPART
          rampart.hits = 4123
          // @ts-ignore why
          structure.pos.building = () => rampart
        })

        it('returns sum of hits', () => {
          expect(structure.effectiveHits).to.eq(4246)
        })
      })
    })
  })
})
