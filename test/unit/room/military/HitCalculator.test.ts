import HitCalculator from 'room/military/HitCalculator'
import { expect } from '../../../expect'

describe('HitCalculator', () => {
  let creep: Creep
  let calculator: HitCalculator
  let tower: StructureTower
  let dealers: Creep[]
  let healers: Creep[]
  beforeEach(() => {
    const room = {} as Room
    room.buildings = {} as RoomBuildings
    tower = {} as StructureTower
    tower.attackPowerAt = () => 1
    tower.owner = { username: 'test' }
    room.buildings.towers = [tower]

    creep = {} as Creep
    creep.corpus = {} as Corpus
    creep.corpus.healPowerAt = () => 2
    creep.corpus.damageDealt = (d) => d

    const dealer = {} as Creep
    dealer.corpus = {} as Corpus
    dealer.corpus.attackPowerAt = () => 4
    dealers = [dealer]

    const healer = {} as Creep
    healer.corpus = {} as Corpus
    healer.corpus.healPowerAt = () => 8
    healers = [healer, creep]

    calculator = new HitCalculator(room)
  })

  it('returns arbitrary value dealt damage', () => {
    calculator.fetch(false)
    expect(calculator.getFor(creep, dealers, healers)).to.eql(-5)
  })

  it('negates tower power attack', () => {
    calculator.fetch(true)
    expect(calculator.getFor(creep, dealers, healers)).to.eql(-6)
  })
})
