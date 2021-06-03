declare class CreepCorpus {
  count(type: BodyPartConstant): number
  hasActive(type: BodyPartConstant): boolean
  healPowerAt(creep: _HasRoomPosition): number
  attackPowerAt(creep: _HasRoomPosition): number
  damageDealt(baseAmount: number): number
  rangedMassAttackPowerAt(roomObject: RoomObject): number
  armed: boolean
  safeDistance: number
  healPower: number
  rangedHealPower: number
  attackPower: number
  rangedAttackPower: number
  healthy: boolean
}
