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

  get armed() {
    return this.hasActive(ATTACK) || this.hasActive(RANGED_ATTACK)
  }

  get safeDistance() {
    if (this.hasActive(RANGED_ATTACK)) return 5
    else if (this.hasActive(ATTACK)) return 3
    return 1
  }

  get healPower() {
    return this.creep.body.reduce(
      (total, p) => total + this.partHealPower(p),
      0,
    )
  }

  get rangedHealPower() {
    return this.healPower * (RANGED_HEAL_POWER / HEAL_POWER)
  }

  private partHealPower(part: Creep['body'][0]) {
    if (part.type !== HEAL || !part.hits) return 0
    if (!part.boost) return HEAL_POWER
    return BOOSTS.heal[part.boost].heal * HEAL_POWER
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
