import '../../constants'
import { expect } from '../../../expect'
import ThrespassPathfinder from 'planner/military/ThrespassPathfinder'
import Sinon from 'sinon'
import HitCalculator from 'room/military/HitCalculator'
import { CostMatrix } from '../../mock'

let source: RoomPosition
let targets: RoomPosition[]
let pathFinder: ThrespassPathfinder
let room: Room
let hitCalculator: HitCalculator
const pathFinderPath: PathFinderPath = {} as PathFinderPath
describe('ThrespassPathFinder', () => {
  beforeEach(() => {
    // @ts-ignore adding PathFinder to global
    global.PathFinder = { CostMatrix }
    PathFinder.search = Sinon.stub().returns(pathFinderPath)
    hitCalculator = {} as HitCalculator
    hitCalculator.fetch = Sinon.stub()
    hitCalculator.getDamage = Sinon.stub().returns(0)
    room = {} as Room
    room.find = () => []
    source = new RoomPosition(12, 34, 'test')
    targets = [new RoomPosition(13, 34, 'test')]
    pathFinder = new ThrespassPathfinder(source, targets)
  })

  describe('#search', () => {
    it('returns pathfinder search result', () => {
      expect(pathFinder.search(room, hitCalculator)).to.eql({})
      expect(hitCalculator.fetch).to.be.calledOnceWithExactly(false)
    })
  })

  describe('+damage', () => {
    it('returns damage 0', () => {
      pathFinder.search(room, hitCalculator)
      expect(pathFinder.damage).to.eq(0)
    })
  })
})
