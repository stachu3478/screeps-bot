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
  private maxAllyDamage: number = -Infinity
  private maxOptimisticHitsDealt: number = -Infinity

  constructor(room: Room) {
    this.room = room
    this.enemies = new RoomEnemies(room)
    this.calculator = new HitCalculator(room)
  }

  fetch() {
    this.calculator.fetch(true)
    const enemies = this.enemies.find()
    const allies = findFighters(this.room)
    this.maxAllyDamage = _.sum(allies, (a) => a.corpus.attackPower)
    const enemyHitsHealed = enemies.map((c, i) =>
      this.calculator.healPower(allies, c),
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
    this.enemyCreep = _.max(enemies, (v, i) => enemySummary[i])
    this.maxHitsDealt = _.max(enemySummary)
    this.maxOptimisticHitsDealt = _.max(enemyOptimisticSummary)
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

  get maxDealable() {
    return this.maxOptimisticHitsDealt
  }
}
