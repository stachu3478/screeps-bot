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
    return 0 // todo
  }

  get rangedHealPower() {
    return 0 // todo
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
