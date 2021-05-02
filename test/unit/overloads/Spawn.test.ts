import '../constants'
import '../../../src/overloads/all'
import { expect } from '../../expect'
import sinon from 'sinon'

describe('StructureSpawn', () => {
  let spawn: StructureSpawn
  beforeEach(() => {
    spawn = new StructureSpawn('test' as Id<StructureSpawn>)
  })

  describe('#cache', () => {
    it('returns cache', () => {
      expect(spawn.cache).to.be.an('Object')
    })
  })

  describe('#distanceToController', () => {
    const distance = Math.random()
    const cachedDistance = Math.random()
    beforeEach(() => {
      spawn.pos = {} as RoomPosition
      spawn.pos.findPathTo = () => []
      spawn.room = { controller: {} } as Room
      sinon
        .stub(spawn.pos, 'findPathTo')
        .returns({ length: distance } as PathStep[])
    })

    context('when cached', () => {
      beforeEach(() => {
        spawn.cache.distanceToController = cachedDistance
      })

      it('returns cached value', () => {
        expect(spawn.distanceToController).to.eql(cachedDistance)
        expect(spawn.pos.findPathTo).to.not.be.called
      })
    })

    context('when not cached', () => {
      beforeEach(() => {
        delete spawn.cache.distanceToController
      })

      it('returns distance to controller', () => {
        expect(spawn.distanceToController).to.eql(distance)
        expect(spawn.cache.distanceToController).to.eql(distance)
        expect(spawn.pos.findPathTo).to.be.calledOnceWithExactly(
          spawn.room.controller,
        )
      })
    })
  })
})
