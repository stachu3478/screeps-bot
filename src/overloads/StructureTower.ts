const TOWER_FALLOFF_DAMAGE = (1 - TOWER_FALLOFF) * TOWER_POWER_ATTACK
const optimalDamageBonus = TOWER_POWER_ATTACK - TOWER_FALLOFF_DAMAGE
const towerFalloffAreaRange = TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE
const attackRangeFactor = optimalDamageBonus / towerFalloffAreaRange
StructureTower.prototype.attackPowerAt = function (creep: _HasRoomPosition) {
  const range = this.pos.getRangeTo(creep)
  if (this.store[RESOURCE_ENERGY] < TOWER_ENERGY_COST) return 0
  if (range >= TOWER_FALLOFF_RANGE) return TOWER_FALLOFF_DAMAGE
  if (range <= TOWER_OPTIMAL_RANGE) return TOWER_POWER_ATTACK
  return TOWER_POWER_ATTACK - attackRangeFactor * (range - TOWER_OPTIMAL_RANGE)
}
