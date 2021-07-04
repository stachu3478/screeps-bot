declare class Corpus {
  count(type: BodyPartConstant): number
  hasActive(type: BodyPartConstant): boolean
  healPowerAt(creep: _HasRoomPosition): number
  attackPowerAt(creep: _HasRoomPosition): number
  damageDealt(baseAmount: number): number
  rangedMassAttackPowerAt(roomObject: RoomObject): number
  getActive(type: BodyPartConstant): number
  effectiveHitsMax: number
  cost: number
  armed: boolean
  safeDistance: number
  healPower: number
  rangedHealPower: number
  attackPower: number
  rangedAttackPower: number
  healthy: boolean
}
