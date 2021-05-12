import _ from 'lodash'
import { Fighter } from 'role/creep/fighter'

const TOWER_FALLOFF_DAMAGE = (1 - TOWER_FALLOFF) * TOWER_POWER_ATTACK
const optimalDamageBonus = TOWER_POWER_ATTACK - TOWER_FALLOFF_DAMAGE
const towerFalloffAreaRange = TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE
const attackRangeFactor = optimalDamageBonus / towerFalloffAreaRange
export function getTowerAttackPower(tower: StructureTower, atRange: number) {
  if (tower.store[RESOURCE_ENERGY] < TOWER_ENERGY_COST) return 0
  if (atRange >= TOWER_FALLOFF_RANGE) return TOWER_FALLOFF_DAMAGE
  if (atRange <= TOWER_OPTIMAL_RANGE) return TOWER_POWER_ATTACK
  return (
    TOWER_POWER_ATTACK - attackRangeFactor * (atRange - TOWER_OPTIMAL_RANGE)
  )
}

export function getHitSummary(
  body: Creep['body'],
  dealt: number,
  healed: number,
) {
  let summary = 0
  let remaining = dealt
  body.every((part) => {
    let damage = 0
    let hitsRemoved = 0
    if (part.type !== TOUGH || !part.boost)
      hitsRemoved = damage = Math.min(part.hits, remaining)
    else {
      const boostMultipler = BOOSTS.tough[part.boost].damage
      hitsRemoved = Math.min(part.hits, remaining * boostMultipler)
      damage = Math.min(part.hits / boostMultipler, remaining)
    }
    summary += hitsRemoved
    remaining -= damage
    return remaining > 0
  })
  return summary - healed + remaining
}

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
    enemyDealable[i] += towers.reduce(
      (s, t) => s + getTowerAttackPower(t, c.pos.rangeTo(t)),
      0,
    )
    enemyDealable[i] += fighters.reduce((t, f) => {
      return t + f.corpus.attackPowerAt(c)
    }, 0)
    enemySummary[i] = getHitSummary(c.body, enemyDealable[i], enemyHealable[i])
  })
  const best: Creep = _.max(enemies, (v, i) => enemySummary[i])
  const value = _.max(enemySummary)
  return {
    enemy: best,
    vulnerability: value,
  }
}
