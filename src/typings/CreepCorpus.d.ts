declare class CreepCorpus {
  count(type: BodyPartConstant): number
  hasActive(type: BodyPartConstant): boolean
  armed: boolean
  safeDistance: number
  healPower: number
  rangedHealPower: number
}
