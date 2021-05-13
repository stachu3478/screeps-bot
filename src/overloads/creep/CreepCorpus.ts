import _, { Dictionary } from 'lodash'
import Memoized from 'utils/Memoized'

const CREEP_BODY_HITS = 100
export default class CreepCorpus extends Memoized<Creep> {
  private bodyPartCount: { [key: string]: number | undefined } = {}
  private hitThresholds: Dictionary<number> = {}

  constructor(creep: Creep) {
    super(creep)
    this.computeBodyPartHitThresholdAndCount()
  }

  count(type: BodyPartConstant) {
    return this.bodyPartCount[type] || 0
  }

  hasActive(type: BodyPartConstant) {
    if (!this.object) return 0
    return this.object.hits > this.hitThresholds[type]
  }

  healPowerAt(creep: _HasRoomPosition) {
    if (!this.object) return 0
    const range = this.object.pos.getRangeTo(creep)
    if (range > 3) return 0
    if (range > 1) return this.rangedHealPower
    return this.healPower
  }

  attackPowerAt(creep: _HasRoomPosition) {
    if (!this.object) return 0
    const range = this.object.pos.getRangeTo(creep)
    if (range > 3) return 0
    if (range > 1) return this.rangedAttackPower
    return this.attackPower + this.rangedAttackPower
  }

  damageDealt(baseAmount: number) {
    let dealt = 0
    let remaining = baseAmount
    this.object!.body.every((part) => {
      let damage = 0
      if (part.type !== TOUGH || !part.boost)
        dealt += damage = Math.min(part.hits, remaining)
      else {
        const boostMultipler = BOOSTS.tough[part.boost].damage
        dealt += Math.min(part.hits, remaining * boostMultipler)
        damage = Math.min(part.hits / boostMultipler, remaining)
      }
      remaining -= damage
      return remaining > 0
    })
    return dealt + remaining
  }

  get armed() {
    return this.hasActive(ATTACK) || this.hasActive(RANGED_ATTACK)
  }

  get safeDistance() {
    if (this.hasActive(RANGED_ATTACK)) return 5
    else if (this.hasActive(ATTACK)) return 3
    return 1
  }

  get healPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partHealPower(p), 0)
  }

  get rangedHealPower() {
    return this.healPower * (RANGED_HEAL_POWER / HEAL_POWER)
  }

  get attackPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partAttackPower(p), 0)
  }

  get rangedAttackPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partRangedPower(p), 0)
  }

  private partHealPower(part: Creep['body'][0]) {
    if (part.type !== HEAL || !part.hits) return 0
    if (!part.boost) return HEAL_POWER
    return BOOSTS.heal[part.boost].heal * HEAL_POWER
  }

  private partAttackPower(part: Creep['body'][0]) {
    if (part.type !== ATTACK || !part.hits) return 0
    if (!part.boost) return ATTACK_POWER
    return BOOSTS.attack[part.boost].attack * ATTACK_POWER
  }

  private partRangedPower(part: Creep['body'][0]) {
    if (part.type !== RANGED_ATTACK || !part.hits) return 0
    if (!part.boost) return RANGED_ATTACK_POWER
    return BOOSTS.ranged_attack[part.boost].rangedAttack * RANGED_ATTACK_POWER
  }

  private computeBodyPartHitThresholdAndCount() {
    const minUnreachableHits = MAX_CREEP_SIZE * CREEP_BODY_HITS + 1
    const dict = _.mapValues(BODYPART_COST, (_) => minUnreachableHits)
    if (!this.object) return
    this.object.body.reverse().forEach((part, i) => {
      const type = part.type
      dict[type] = Math.min(i * CREEP_BODY_HITS, dict[type])
      if (!this.bodyPartCount[type]) this.bodyPartCount[type] = 0
      this.bodyPartCount[type]!++
    })
    this.hitThresholds = dict
  }
}
