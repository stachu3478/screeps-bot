import _ from 'lodash'
import RoomEnemies from './RoomEnemies'
import { findFighters } from 'utils/find'
import HitCalculator from './HitCalculator'

export default class EnemyPicker {
  private room: Room
  private enemies: RoomEnemies
  private calculator: HitCalculator
  private enemyCreep?: AnyCreep
  private maxHitsDealt: number = 0
  private maxAllyDamage: number = 0
  private maxOptimisticHitsDealt: number = 0

  constructor(
    room: Room,
    enemies = new RoomEnemies(room),
    calculator = new HitCalculator(room),
  ) {
    this.room = room
    this.enemies = enemies
    this.calculator = calculator
  }

  fetch() {
    this.calculator.fetch(true)
    const enemies = this.enemies.find()
    if (!enemies.length) {
      return
    }
    const allies = findFighters(this.room)
    this.maxAllyDamage = _.sum(allies, (a) => a.corpus.attackPower)
    const enemyHitsHealed = enemies.map((c, i) =>
      this.calculator.healPower(enemies, c),
    )
    const enemySummary = enemies.map(
      (c, i) => this.calculator.getFor(c, allies, []) - enemyHitsHealed[i],
    )
    const enemyOptimisticSummary = enemies.map(
      (c, i) =>
        this.maxAllyDamage -
        enemyHitsHealed[i] +
        this.calculator.towersAttackPower(c),
    )
    console.log(enemyHitsHealed, enemySummary)
    this.enemyCreep = _.max(enemies, (v, i) => enemySummary[i])
    this.maxHitsDealt = _.max(enemySummary)
    this.maxOptimisticHitsDealt = _.max(enemyOptimisticSummary)
  }

  get enemy() {
    return this.enemyCreep
  }

  get dealt() {
    return this.maxHitsDealt
  }

  get maxDealable() {
    return this.maxOptimisticHitsDealt
  }
}
