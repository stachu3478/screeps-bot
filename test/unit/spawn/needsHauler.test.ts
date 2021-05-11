import '../constants'
import { Memory } from '../mock'
import Game from '../mock/Game'
import { expect } from '../../expect'
import { needsHauler } from 'spawn/hauler'

describe('spawn/needsHauler', () => {
  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game)
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory)
  })

  let haulers: number
  let spawn: StructureSpawn
  context('when no haulers', () => {
    beforeEach(() => {
      haulers = 0
    })

    context('when room has storage', () => {
      beforeEach(() => {
        spawn = {
          room: { storage: {}, name: 'myRoom', memory: {} },
        } as StructureSpawn
      })

      context('when extensions are filled with energy', () => {
        beforeEach(() => {
          spawn.room.filled = true
        })

        context('when room to haul is present', () => {
          beforeEach(() => {
            spawn.room.memory = { _haul: 'anyRoom' }
          })

          it('returns true', () => {
            expect(needsHauler(spawn, haulers)).to.be.true
          })

          context('when room name to haul is the mother room', () => {
            beforeEach(() => {
              spawn.room.memory = { _haul: 'myRoom' }
            })

            it('returns false - harvester will collect resources there instead', () => {
              expect(needsHauler(spawn, haulers)).to.be.false
            })
          })
        })

        context('when room to haul is not present', () => {
          beforeEach(() => {
            spawn.room.filled = false
          })

          it('returns false - hauler spawning should only drain excess energy', () => {
            expect(needsHauler(spawn, haulers)).to.be.false
          })
        })
      })

      context('when extensions are not filled with energy', () => {
        beforeEach(() => {
          spawn.room.filled = false
        })

        it('returns false - hauler spawning should only drain excess energy', () => {
          expect(needsHauler(spawn, haulers)).to.be.false
        })
      })
    })

    context('when room has no storage', () => {
      beforeEach(() => {
        spawn = { room: { filled: true, memory: {} } } as StructureSpawn
      })

      it('returns false - hauler cannot have a big container to fill', () => {
        expect(needsHauler(spawn, haulers)).to.be.false
      })
    })
  })

  context('when hauler is present', () => {
    beforeEach(() => {
      haulers = 1
    })

    it('returns false - only one hauler should be at the time', () => {
      expect(needsHauler({} as StructureSpawn, haulers)).to.be.false
    })
  })
})
