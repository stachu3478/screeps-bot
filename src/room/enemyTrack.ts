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

function getHealPower(creep: Creep, distant: boolean = false) {
  let heal = 0
  creep.body.forEach(part => {
    if (part.type !== HEAL) return
    const boost = (BOOSTS.heal as BoostMap)[part.boost || ''] || { heal: 1, rangedHeal: 1 }
    heal += distant ? boost.rangedHeal : boost.heal
  })
  return heal
}

export function findMostVulnerableCreep(enemies: Creep[], towers: StructureTower[], fighters: Creep[]) {
  const enemyHealable: number[] = []
  const enemyDealable: number[] = []
  const enemySummary: number[] = []
  const falloff = TOWER_FALLOFF_RANGE / TOWER_OPTIMAL_RANGE
  const fighterDamage = fighters.reduce((v, c) => v + c.getActiveBodyparts(ATTACK) * ATTACK_POWER, 0)
  enemies.forEach((c, i) => {
    enemyHealable[i] = 0
    enemyDealable[i] = fighterDamage
    enemies.forEach(h => {
      const healParts = h.getActiveBodyparts(HEAL);
      if (!healParts) return
      const distance = c.pos.getRangeTo(h)
      if (distance > 3) return
      if (distance > 1) enemyHealable[i] += getHealPower(h, true)
      else enemyHealable[i] += getHealPower(h)
    })
    towers.forEach(t => {
      const range = c.pos.getRangeTo(t)
      if (range >= TOWER_FALLOFF_RANGE) enemyDealable[i] += TOWER_POWER_ATTACK / falloff
      else if (range <= TOWER_OPTIMAL_RANGE) enemyDealable[i] += TOWER_POWER_ATTACK
      else enemyDealable[i] += TOWER_POWER_ATTACK * (TOWER_OPTIMAL_RANGE / range)
    })
    enemySummary[i] = enemyDealable[i] - enemyHealable[i]
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
  return room.find(FIND_HOSTILE_CREEPS, {
    filter: (creep) => {
      const treshold = (list[creep.owner.username] || 0)
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
