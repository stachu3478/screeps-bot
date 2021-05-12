import _ from 'lodash'

export default class HitCalculator {
  private room: Room
  private towerDealers!: StructureTower[]

  constructor(room: Room) {
    this.room = room
  }

  fetch() {
    this.towerDealers = this.room.buildings.towers
  }

  getFor(creep: Creep, dealers: Creep[], healers: Creep[]) {
    const heal = this.healPower(healers, creep)
    const attack =
      this.attackPower(dealers, creep) +
      this.towersAttackPower(this.towerDealers, creep)
    return creep.corpus.damageDealt(attack) - heal
  }

  private healPower(enemies: Creep[], target: Creep) {
    return _.sum(enemies, (e) => e.corpus.healPowerAt(target))
  }

  private attackPower(allies: Creep[], target: Creep) {
    return _.sum(allies, (a) => a.corpus.attackPowerAt(target))
  }

  private towersAttackPower(towers: StructureTower[], target: Creep) {
    return _.sum(towers, (t) => t.attackPowerAt(target))
  }
}
