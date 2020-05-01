export default function tower(tower: StructureTower, enemy: Creep) {
  const distanceToOpt = (tower.pos.getRangeTo(enemy.pos) - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
  const storage = (tower.store.getUsedCapacity() || 0) / (tower.store.getCapacity() || 1)
  if (storage / distanceToOpt > 1) tower.attack(enemy)
}
