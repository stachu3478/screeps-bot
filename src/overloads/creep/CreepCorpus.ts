import _, { Dictionary } from 'lodash'
import CreepMemoized from 'utils/CreepMemoized'

const CREEP_BODY_HITS = 100
export default class CreepCorpus extends CreepMemoized<Creep> {
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
    return this.creep.hits > this.hitThresholds[type]
  }

  healPowerTo(creep: _HasRoomPosition) {
    const range = this.creep.pos.getRangeTo(creep)
    if (range > 3) return 0
    if (range > 1) return this.rangedHealPower
    return this.healPower
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
    return this.creep.body.reduce((sum, p) => sum + this.partHealPower(p), 0)
  }

  get rangedHealPower() {
    return this.healPower * (RANGED_HEAL_POWER / HEAL_POWER)
  }

  get attackPower() {
    return this.creep.body.reduce((sum, p) => sum + this.partAttackPower(p), 0)
  }

  get rangedAttackPower() {
    return this.creep.body.reduce((sum, p) => sum + this.partRangedPower(p), 0)
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
    this.creep.body.reverse().forEach((part, i) => {
      const type = part.type
      dict[type] = Math.min(i * CREEP_BODY_HITS, dict[type])
      if (!this.bodyPartCount[type]) this.bodyPartCount[type] = 0
      this.bodyPartCount[type]!++
    })
    this.hitThresholds = dict
  }
}
