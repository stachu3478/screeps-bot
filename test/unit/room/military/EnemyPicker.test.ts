import EnemyPicker from 'room/military/EnemyPicker'
import HitCalculator from 'room/military/HitCalculator'
import RoomEnemies from 'room/military/RoomEnemies'
import { expect } from '../../../expect'

describe('EnemyPicker', () => {
  let creep: Creep
  let picker: EnemyPicker
  let calculator: HitCalculator
  let roomEnemies: RoomEnemies
  let tower: StructureTower
  let enemy: Creep
  beforeEach(() => {
    const room = {} as Room
    room.findHostileCreeps = () => []
    room.findHostilePowerCreeps = () => []
    room.find = () => []
    room.buildings = {} as RoomBuildings
    tower = {} as StructureTower
    tower.attackPowerAt = () => 1
    tower.owner = { username: 'test' }
    room.buildings.towers = [tower]

    enemy = {} as Creep

    calculator = {} as HitCalculator
    calculator.fetch = () => {}
    calculator.healPower = () => 0
    calculator.getFor = () => 0
    calculator.towersAttackPower = () => 0
    roomEnemies = {} as RoomEnemies
    roomEnemies.find = () => []
    picker = new EnemyPicker(room, roomEnemies, calculator)
  })

  describe('#any', () => {
    it('returns false when no enemy', () => {
      picker.fetch()
      expect(picker.any).to.be.false
    })

    it('returns true when enemy', () => {
      roomEnemies.find = () => [enemy]
      picker.fetch()
      expect(picker.any).to.be.true
    })
  })

  describe('#dealt', () => {
    beforeEach(() => {
      roomEnemies.find = () => [enemy]
    })

    it('returns 0 when no damage curretly dealable', () => {
      picker.fetch()
      expect(picker.dealt).to.eq(0)
    })

    it('returns -1000 when can be healed by 1000', () => {
      calculator.healPower = (_, target) => {
        if (target === enemy) {
          return 1000
        }
        return 0
      }
      picker.fetch()
      expect(picker.dealt).to.eq(-1000)
    })
  })
})
