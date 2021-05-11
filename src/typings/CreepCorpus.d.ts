declare class CreepCorpus {
  count(type: BodyPartConstant): number
  hasActive(type: BodyPartConstant): boolean
  healPowerTo(creep: _HasRoomPosition): number
  armed: boolean
  safeDistance: number
  healPower: number
  rangedHealPower: number
  attackPower: number
  rangedAttackPower: number
}
