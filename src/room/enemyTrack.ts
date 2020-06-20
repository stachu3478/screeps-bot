import _ from 'lodash'

function rankCreep(creep: Creep) {
  return (creep.getActiveBodyparts(HEAL) << 10)
    + (creep.getActiveBodyparts(CLAIM) << 10)
    + (creep.getActiveBodyparts(RANGED_ATTACK) << 7)
    + (creep.getActiveBodyparts(ATTACK) << 5)
    + (creep.getActiveBodyparts(WORK) << 3)
}

interface BoostMap {
  [key: string]: {
    heal: number
    rangedHeal: number
  } | undefined
}

type BodyPart = Creep['body'][0]
export function getBodypartHealPower(part: BodyPart) {
  if (part.type !== HEAL || !part.hits) return 0
  const boost = healBoosts[part.boost || ''] || { heal: 1, rangedHeal: 1 }
  return boost.heal * HEAL_POWER
}

const TOWER_FALLOFF_DAMAGE = (1 - TOWER_FALLOFF) * TOWER_POWER_ATTACK
const optimalDamageBonus = TOWER_POWER_ATTACK - TOWER_FALLOFF_DAMAGE
const towerFalloffAreaRange = TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE
const attackRangeFactor = optimalDamageBonus / towerFalloffAreaRange
export function getTowerAttackPower(tower: StructureTower, atRange: number) {
  if (tower.store[RESOURCE_ENERGY] < TOWER_ENERGY_COST) return 0
  if (atRange >= TOWER_FALLOFF_RANGE) return TOWER_FALLOFF_DAMAGE
  if (atRange <= TOWER_OPTIMAL_RANGE) return TOWER_POWER_ATTACK
  return TOWER_FALLOFF_DAMAGE + attackRangeFactor * (atRange - TOWER_OPTIMAL_RANGE)
}

export function getHitSummary(body: Creep['body'], dealt: number, healed: number) {
  let summary = 0
  let remaining = dealt
  body.every(part => {
    let damage = 0
    let hitsRemoved = 0
    if (part.type !== TOUGH || !part.boost) hitsRemoved = damage = Math.min(part.hits, remaining)
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

const healBoosts = BOOSTS.heal as BoostMap
const distancedFactor = RANGED_HEAL_POWER / HEAL_POWER
function getHealPower(creep: Creep, distant: boolean = false) {
  const healPower = creep.body.reduce((t, part) => t + getBodypartHealPower(part), 0)
  return distant ? healPower * distancedFactor : healPower
}

export function findMostVulnerableCreep(enemies: Creep[], towers: StructureTower[], fighters: Creep[]) {
  const enemyHealable: number[] = []
  const enemyDealable: number[] = []
  const enemySummary: number[] = []
  const fighterDamage = fighters.reduce((v, c) => v + c.getActiveBodyparts(ATTACK) * ATTACK_POWER, 0)
  enemies.forEach((c, i) => {
    enemyHealable[i] = 0
    enemyDealable[i] = fighterDamage
    enemies.forEach(h => {
      const distance = c.pos.rangeTo(h)
      if (distance > 3) return
      if (distance > 1) enemyHealable[i] += getHealPower(h, true)
      else enemyHealable[i] += getHealPower(h)
    })
    enemyDealable[i] += towers.reduce((s, t) => s + getTowerAttackPower(t, c.pos.rangeTo(t)), 0)
    enemySummary[i] = getHitSummary(c.body, enemyDealable[i], enemyHealable[i])
  })
  const best: Creep = _.max(enemies, (v, i) => enemySummary[i])
  const value = _.max(enemySummary)
  return {
    enemy: best,
    vulnerability: value
  }
}

export default function trackEnemy(room: Room): Creep[] {
  if (!Memory.whitelist) Memory.whitelist = {}
  const list = Memory.whitelist
  const black = Memory.blacklist || {}
  return room.find(FIND_HOSTILE_CREEPS, {
    filter: (creep) => {
      const treshold = (list[creep.owner.username] || -black[creep.owner.username] || 0)
        - creep.getActiveBodyparts(ATTACK)
        - creep.getActiveBodyparts(WORK)
        - creep.getActiveBodyparts(RANGED_ATTACK)
        - creep.getActiveBodyparts(CLAIM)
        - creep.getActiveBodyparts(HEAL)
      if (treshold < 0) delete list[creep.owner.username]
      return treshold < 0
    }
  }).sort((a, b) => rankCreep(b) - rankCreep(a))
}
