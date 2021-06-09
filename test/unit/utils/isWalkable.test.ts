import { expect } from '../../expect'
import { isWalkable } from 'utils/path'

describe('utils/path.isWalkable', () => {
  let room: Room
  beforeEach(() => {
    room = {} as Room
    room.lookForAt = () => []
  })

  context('when the terrain is not walkable', () => {
    beforeEach(() => {
      room.getTerrain = () => ({
        get: () => TERRAIN_MASK_WALL,
      })
    })

    it('returns false', () => {
      expect(isWalkable(room, 12, 34)).to.eql(false)
    })

    context('when there is walkable structure on it', () => {
      beforeEach(() => {
        room.lookForAt = ((type: LookConstant) => {
          if (type === LOOK_STRUCTURES) return [{ isWalkable: true }]
          return []
        }) as Room['lookForAt']
      })

      it('returns true', () => {
        expect(isWalkable(room, 12, 34)).to.eql(true)
      })

      it('returns true', () => {
        expect(isWalkable(room, 12, 34, {} as Creep)).to.eql(true)
      })
    })
  })

  context('when terrain is walkable', () => {
    beforeEach(() => {
      room.getTerrain = () => ({
        get: () => 0,
      })
    })

    it('returns true', () => {
      expect(isWalkable(room, 12, 34)).to.eql(true)
    })

    it('returns true', () => {
      expect(isWalkable(room, 12, 34, {} as Creep)).to.eql(true)
    })

    context('when tile contains non-walkable structure', () => {
      beforeEach(() => {
        room.lookForAt = ((type: LookConstant) => {
          if (type === LOOK_STRUCTURES) return [{ isWalkable: false }]
          return []
        }) as Room['lookForAt']
      })

      it('returns false', () => {
        expect(isWalkable(room, 12, 34)).to.eql(false)
      })
    })

    context('when tile contains non-walkable construction site', () => {
      beforeEach(() => {
        room.lookForAt = ((type: LookConstant) => {
          if (type === LOOK_CONSTRUCTION_SITES) return [{ isWalkable: false }]
          return []
        }) as Room['lookForAt']
      })

      it('returns false', () => {
        expect(isWalkable(room, 12, 34)).to.eql(false)
      })
    })

    context('when tile contains creep', () => {
      beforeEach(() => {
        room.lookForAt = ((type: LookConstant) => {
          if (type === LOOK_CREEPS) return [{}]
          return []
        }) as Room['lookForAt']
      })

      it('returns false', () => {
        expect(isWalkable(room, 12, 34)).to.eql(false)
      })

      context('when creep is me', () => {
        let creep: Creep
        beforeEach(() => {
          creep = {} as Creep
          room.lookForAt = ((type: LookConstant) => {
            if (type === LOOK_CREEPS) return [creep]
            return []
          }) as Room['lookForAt']
        })

        it('returns true', () => {
          expect(isWalkable(room, 12, 34, creep)).to.eql(true)
        })
      })
    })
  })
})
