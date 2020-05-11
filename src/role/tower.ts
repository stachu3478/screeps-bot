export default function tower(tower: StructureTower, enemy?: Creep | PowerCreep) {
  if (!enemy) return
  if (enemy.my) {
    tower.heal(enemy)
  } else {
    tower.attack(enemy)
  }
}
