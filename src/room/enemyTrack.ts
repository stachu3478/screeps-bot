import _ from 'lodash'
import { Fighter } from 'role/creep/fighter'

export function findMostVulnerableCreep(
  enemies: Creep[],
  towers: StructureTower[],
  fighters: Fighter[],
) {
  const enemyHealable: number[] = []
  const enemyDealable: number[] = []
  const enemySummary: number[] = []
  enemies.forEach((c, i) => {
    enemyHealable[i] = 0
    enemyDealable[i] = 0
    enemies.forEach((h) => {
      enemyHealable[i] += h.corpus.healPowerAt(c)
    })
    enemyDealable[i] += towers.reduce((s, t) => s + t.attackPowerAt(c), 0)
    enemyDealable[i] += fighters.reduce((t, f) => {
      return t + f.corpus.attackPowerAt(c)
    }, 0)
    enemySummary[i] = c.corpus.damageDealt(enemyDealable[i]) - enemyHealable[i]
  })
  const best: Creep = _.max(enemies, (v, i) => enemySummary[i])
  const value = _.max(enemySummary)
  return {
    enemy: best,
    vulnerability: value,
  }
}
