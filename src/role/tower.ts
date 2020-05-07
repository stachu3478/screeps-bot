export default function tower(tower: StructureTower, enemy: Creep) {
  if (enemy.my) {
    tower.heal(enemy)
  } else {
    const distanceToOpt = (tower.pos.getRangeTo(enemy.pos) - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
    const storage = tower.store[RESOURCE_ENERGY] / tower.store.getCapacity(RESOURCE_ENERGY)
    if (storage / distanceToOpt > 1 || storage >= 0.9) tower.attack(enemy)
  }
}
