import '../constants'
import '../../../src/overloads/all'
import { expect } from '../../expect'

describe('StructureNuker', () => {
  let nuker: StructureNuker
  beforeEach(() => {
    nuker = new StructureNuker('test' as Id<StructureNuker>)
    nuker.store = {} as Store<RESOURCE_ENERGY, false>
  })

  describe('readyToLaunch', () => {
    describe('when not filled', () => {
      beforeEach(() => {
        // @ts-ignore store deep mock
        nuker.store.getFreeCapacity = (r) => {
          if (r === RESOURCE_ENERGY) return 30000
          if (r === RESOURCE_GHODIUM) return 5000
          return null
        }
      })

      it('returns false', () => {
        expect(nuker.readyToLaunch).to.be.false
      })
    })

    describe('when filled', () => {
      beforeEach(() => {
        // @ts-ignore store deep mock
        nuker.store.getFreeCapacity = (r) => {
          if (r === RESOURCE_ENERGY) return 0
          if (r === RESOURCE_GHODIUM) return 0
          return null
        }
      })

      describe('when has cooldown', () => {
        beforeEach(() => {
          nuker.cooldown = 1
        })

        it('returns false', () => {
          expect(nuker.readyToLaunch).to.be.false
        })
      })

      describe('when has not cooldown', () => {
        beforeEach(() => {
          nuker.cooldown = 0
        })

        describe('when is not active', () => {
          beforeEach(() => {
            nuker.isActive = () => false
          })

          it('returns false', () => {
            expect(nuker.readyToLaunch).to.be.false
          })
        })

        describe('when is active', () => {
          beforeEach(() => {
            nuker.isActive = () => true
          })

          it('returns true', () => {
            expect(nuker.readyToLaunch).to.be.true
          })
        })
      })
    })
  })
})
