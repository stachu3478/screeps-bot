import player from 'constants/player'
import _ from 'lodash'

export default class HitCalculator {
  private room: Room
  private towerDealers: StructureTower[] = []

  constructor(room: Room) {
    this.room = room
  }

  fetch(friendly: boolean) {
    this.towerDealers = this.room.buildings.towers.filter(
      (t) => friendly === (t.owner.username === player),
    )
  }

  getDamage(pos: RoomPosition, dealers: Creep[]) {
    const hasPos = { pos }
    return this.attackPower(dealers, hasPos) + this.towersAttackPower(hasPos)
  }

  getFor(creep: Creep, dealers: Creep[], healers: Creep[]) {
    const heal = this.healPower(healers, creep)
    const damage = this.getDamage(creep.pos, dealers)
    return creep.corpus.damageDealt(damage) - heal
  }

  healPower(enemies: Creep[], target: Creep) {
    return _.sum(enemies, (e) => e.corpus.healPowerAt(target))
  }

  towersAttackPower(
    target: _HasRoomPosition,
    towers: StructureTower[] = this.towerDealers,
  ) {
    return _.sum(towers, (t) => t.attackPowerAt(target))
  }

  private attackPower(allies: Creep[], target: _HasRoomPosition) {
    return _.sum(allies, (a) => a.corpus.attackPowerAt(target))
  }
}
