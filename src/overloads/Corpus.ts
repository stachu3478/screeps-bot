import {
  CREEP_RANGE,
  RANGED_MASS_ATTACK_POWER,
  SOURCE_KEEPER_USERNAME,
} from 'constants/support'
import Memoized from 'utils/Memoized'

export default class Corpus<
  T extends AnyCreep & { id: Id<T> }
> extends Memoized<T> {
  count(type: BodyPartConstant) {
    return 0
  }

  getActive(type: BodyPartConstant) {
    return 0
  }

  hasActive(type: BodyPartConstant) {
    return false
  }

  healPowerAt(creep: _HasRoomPosition) {
    if (!this.object) return 0
    const range = this.object.pos.getRangeTo(creep)
    if (range > CREEP_RANGE) return 0
    if (range > 1) return this.rangedHealPower
    return this.healPower
  }

  attackPowerAt(creep: _HasRoomPosition) {
    if (!this.object) return 0
    const range = this.object.pos.getRangeTo(creep)
    if (range > CREEP_RANGE) return 0
    if (range > 1) return this.rangedAttackPower
    return this.attackPower + this.rangedAttackPower
  }

  rangedMassAttackPowerAt(roomObject: RoomObject) {
    if (!this.object) return 0
    if (
      !(roomObject instanceof Creep || roomObject instanceof OwnedStructure)
    ) {
      return 0
    }
    const range = this.object.pos.getRangeTo(roomObject)
    return RANGED_MASS_ATTACK_POWER[range] || 0
  }

  damageDealt(baseAmount: number) {
    return baseAmount
  }

  get effectiveHitsMax() {
    return this.object?.hitsMax || 0
  }

  get cost() {
    return 0
  }

  get armed() {
    return this.hasActive(ATTACK) || this.hasActive(RANGED_ATTACK)
  }

  get safeDistance() {
    if (this.object?.owner.username === SOURCE_KEEPER_USERNAME) {
      return 3
    }
    if (this.hasActive(RANGED_ATTACK)) {
      return 2 + CREEP_RANGE
    }
    if (this.hasActive(ATTACK)) {
      return 3
    }
    return 1
  }

  get healPower() {
    return 0
  }

  get rangedHealPower() {
    return this.healPower * (RANGED_HEAL_POWER / HEAL_POWER)
  }

  get attackPower() {
    return 0
  }

  get rangedAttackPower() {
    return 0
  }

  get healthy() {
    const creep = this.object
    return !!creep && creep.hits === creep.hitsMax
  }
}
