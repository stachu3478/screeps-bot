import { BODYPART_HITS } from 'constants/support'
import _, { Dictionary } from 'lodash'
import Corpus from '../Corpus'

export default class CreepCorpus extends Corpus<Creep> {
  private bodyPartCount: { [key: string]: number | undefined } = {}
  private hitThresholds: Dictionary<number> = {}

  constructor(creep: Creep) {
    super(creep)
    this.computeBodyPartHitThresholdAndCount()
  }

  count(type: BodyPartConstant) {
    return this.bodyPartCount[type] || 0
  }

  getActive(type: BodyPartConstant) {
    if (!this.object) return 0
    return this.object.body.reduce(
      (sum, p) => sum + (p.type === type && this.partActive(p) ? 1 : 0),
      0,
    )
  }

  hasActive(type: BodyPartConstant) {
    if (!this.object) return false
    return this.object.hits > this.hitThresholds[type]
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

  get cost() {
    return _.sum(this.bodyPartCount, (amount, type) => {
      if (!type || !amount) {
        return 0
      }
      return BODYPART_COST[type as BodyPartConstant] * amount
    })
  }

  get healPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partHealPower(p), 0)
  }

  get attackPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partAttackPower(p), 0)
  }

  get rangedAttackPower() {
    if (!this.object) return 0
    return this.object.body.reduce((sum, p) => sum + this.partRangedPower(p), 0)
  }

  private partActive(part: Creep['body'][0]) {
    return !!part.hits
  }

  private partHealPower(part: Creep['body'][0]) {
    if (part.type !== HEAL || !this.partActive(part)) return 0
    if (!part.boost) return HEAL_POWER
    return BOOSTS.heal[part.boost].heal * HEAL_POWER
  }

  private partAttackPower(part: Creep['body'][0]) {
    if (part.type !== ATTACK || !this.partActive(part)) return 0
    if (!part.boost) return ATTACK_POWER
    return BOOSTS.attack[part.boost].attack * ATTACK_POWER
  }

  private partRangedPower(part: Creep['body'][0]) {
    if (part.type !== RANGED_ATTACK || !this.partActive(part)) return 0
    if (!part.boost) return RANGED_ATTACK_POWER
    return BOOSTS.ranged_attack[part.boost].rangedAttack * RANGED_ATTACK_POWER
  }

  private computeBodyPartHitThresholdAndCount() {
    const minUnreachableHits = MAX_CREEP_SIZE * BODYPART_HITS + 1
    const dict = _.mapValues(BODYPART_COST, (_) => minUnreachableHits)
    if (!this.object) return
    this.object.body.reverse().forEach((part, i) => {
      const type = part.type
      dict[type] = Math.min(i * BODYPART_HITS, dict[type])
      if (!this.bodyPartCount[type]) this.bodyPartCount[type] = 0
      this.bodyPartCount[type]!++
    })
    this.hitThresholds = dict
  }
}
