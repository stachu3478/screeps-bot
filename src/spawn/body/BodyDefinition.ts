import BoostManager from 'overloads/room/BoostManager'
import MovePartCapability from './MovePartCapability'

const toughBoosts = BOOSTS.tough as { [key: string]: { damage: number } }
const toughKeys: ResourceConstant[] = ['XGHO2', 'GHO2', 'GO']
const healBoosts = BOOSTS.heal as { [key: string]: { heal: number } }
const healKeys: ResourceConstant[] = ['XLHO2', 'LHO2', 'LO']
export default class BodyDefinition {
  private minToughDamage: number
  private minToughHealValue: number
  private poly?: BodyPartConstant
  private boosts: BoostManager

  private toughPartCount = 0
  private toughBoost?: ResourceConstant

  private healPartCount = 0
  private healBoost?: ResourceConstant

  private movePartCapability: MovePartCapability

  constructor(
    minToughDamage: number,
    minToughHealValue: number,
    boosts: BoostManager,
    poly: BodyPartConstant,
  ) {
    this.minToughDamage = minToughDamage
    this.minToughHealValue = minToughHealValue
    this.poly = poly
    this.boosts = boosts
    this.movePartCapability = new MovePartCapability(this.boosts)
  }

  get toughResource() {
    return this.toughBoost
  }

  get healResource() {
    return this.healBoost
  }

  get moveResource() {
    return this.movePartCapability.boost
  }

  get toughCount() {
    return this.toughPartCount
  }

  get healCount() {
    return this.healPartCount
  }

  get moveCount() {
    return this.movePartCapability.usedParts
  }

  get polyCount() {
    return MAX_CREEP_SIZE - this.basePartCount
  }

  get polyBodyType() {
    return this.poly
  }

  get valid() {
    return this.basePartCount <= MAX_CREEP_SIZE
  }

  get body() {
    if (this.minToughDamage)
      this.toughBoost = toughKeys.find((b) => {
        const required = Math.ceil(
          (toughBoosts[b].damage * this.minToughDamage) / 100,
        )
        const available = this.boosts.getAvailable(b, required)
        const canBeUsed = available === required
        if (available === required) this.toughPartCount = required
        return canBeUsed
      })

    const damage = this.toughBoost ? toughBoosts[this.toughBoost].damage : 1
    this.healPartCount = Math.ceil(
      (damage * this.minToughHealValue) / HEAL_POWER,
    )
    if (this.minToughHealValue)
      this.healBoost = healKeys.find((b) => {
        const required = Math.ceil(
          (damage * this.minToughHealValue) / (HEAL_POWER * healBoosts[b].heal),
        )
        const available = this.boosts.getAvailable(b, required)
        const canBeUsed = available === required
        if (canBeUsed) this.healPartCount = required
        return canBeUsed
      })

    const body: BodyPartConstant[] = new Array(this.toughPartCount)
      .fill(TOUGH)
      .concat(new Array(Math.max(this.polyCount, 0)).fill(this.poly))
      .concat(new Array(this.healPartCount).fill(HEAL))
      .concat(new Array(this.moveCount).fill(MOVE))
    return body
  }

  set moveParts(c: MovePartCapability) {
    this.movePartCapability = c
  }

  private get basePartCount() {
    return this.toughPartCount + this.healPartCount + this.moveCount
  }
}
