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

  getDamage(pos: RoomPosition, dealers: AnyCreep[]) {
    const hasPos = { pos }
    return this.attackPower(dealers, hasPos) + this.towersAttackPower(hasPos)
  }

  getFor(creep: AnyCreep, dealers: AnyCreep[], healers: AnyCreep[]) {
    const heal = this.healPower(healers, creep)
    const damage = this.getDamage(creep.pos, dealers)
    console.log('getDamage', damage)
    return creep.corpus.damageDealt(damage) - heal
  }

  healPower(enemies: AnyCreep[], target: AnyCreep) {
    return _.sum(enemies, (e) => e.corpus.healPowerAt(target))
  }

  towersAttackPower(
    target: _HasRoomPosition,
    towers: StructureTower[] = this.towerDealers,
  ) {
    const amount = _.sum(towers, (t) => t.attackPowerAt(target))
    return amount
  }

  private attackPower(allies: AnyCreep[], target: _HasRoomPosition) {
    const amount = _.sum(allies, (a) => a.corpus.attackPowerAt(target))
    return amount
  }
}
