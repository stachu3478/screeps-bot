import '../constants'
import 'overloads/all'
import { expect } from '../../expect'
import CacheHandler from 'handler/CacheHandler'
import IntershardMemoryHandler from 'handler/IntershardMemoryHandler'

let cache: GlobalCache
let intershardMemoryHandler: IntershardMemoryHandler
let cacheHandler: CacheHandler
describe('CacheHandler', () => {
  beforeEach(() => {
    cache = {
      spawns: {},
      feromon: {},
      links: {},
    }
    intershardMemoryHandler = {} as IntershardMemoryHandler
    cacheHandler = new CacheHandler(cache, intershardMemoryHandler)
  })

  'creeps spawns powerSpawns rooms terminals factories'
    .split(' ')
    .forEach((property) => {
      const key = property as keyof GlobalCache & keyof CacheHandler
      describe(`#${property}`, () => {
        it(`returns ${property} object from cache`, () => {
          expect(cacheHandler[key]).to.eq(cache[key])
        })
      })
    })

  describe('#ownedRooms', () => {
    context('when value is cached', () => {
      beforeEach(() => {
        Memory.myRooms = {}
        cache.ownedRooms = 5
      })

      it('returns cached value', () => {
        expect(cacheHandler.ownedRooms).to.eq(5)
      })
    })

    context('when value not cached', () => {
      beforeEach(() => {
        Memory.myRooms = { a: 0, b: 0, c: 0 }
      })

      it('returns calculated value', () => {
        expect(cacheHandler.ownedRooms).to.eq(3)
      })

      it('passes value to intershard memory', () => {
        cacheHandler.ownedRooms
        expect(intershardMemoryHandler.ownedRooms).to.eq(3)
      })
    })
  })
})
