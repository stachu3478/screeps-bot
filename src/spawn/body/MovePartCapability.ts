import BoostManager from 'overloads/room/BoostManager'

const moveBoosts = BOOSTS.move as { [key: string]: { fatigue: number } }
const moveKeys: ResourceConstant[] = ['XZHO2', 'ZHO2', 'ZO']
export default class MovePartCapability {
  private boosts: BoostManager
  private partCount = 0
  private speed = 1
  private moveBoost?: ResourceConstant

  constructor(boosts: BoostManager) {
    this.boosts = boosts
    this.partCount = Math.ceil(MAX_CREEP_SIZE / (1 / this.speed + 1))
    this.moveBoost = moveKeys.find((b) => {
      const fatique = this.speed / moveBoosts[b].fatigue
      const required = Math.ceil(MAX_CREEP_SIZE / (1 / fatique + 1))
      const available = this.boosts.getAvailable(b, required)
      const canBeUsed = available === required
      if (canBeUsed) this.partCount = required
      return canBeUsed
    })
  }

  get usedParts() {
    return this.partCount
  }

  get remainingParts() {
    return MAX_CREEP_SIZE - this.partCount
  }

  get boost() {
    return this.moveBoost
  }
}
