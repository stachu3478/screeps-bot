import _ from 'lodash'
import RoomEnemies from './RoomEnemies'
import { findFighters } from 'utils/find'
import HitCalculator from './HitCalculator'

export default class EnemyPicker {
  private room: Room
  private enemies: RoomEnemies
  private calculator: HitCalculator
  private enemyCreep?: Creep
  private maxHitsDealt: number = -Infinity

  constructor(room: Room) {
    this.room = room
    this.enemies = new RoomEnemies(room)
    this.calculator = new HitCalculator(room)
  }

  fetch() {
    this.calculator.fetch()
    const enemies = this.enemies.find()
    const allies = findFighters(this.room)
    const enemySummary = enemies.map((c, i) =>
      this.calculator.getFor(c, allies, enemies),
    )
    this.enemyCreep = _.max(enemies, (v, i) => enemySummary[i])
    this.maxHitsDealt = _.max(enemySummary)
  }

  get any() {
    return this.maxHitsDealt !== -Infinity
  }

  get enemy() {
    return this.enemyCreep
  }

  get dealt() {
    return this.maxHitsDealt
  }
}
