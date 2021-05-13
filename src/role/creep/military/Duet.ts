import _ from 'lodash'
import Memoized from 'utils/Memoized'
import HitCalculator from 'room/military/HitCalculator'

export default class Duet {
  private keeper: Memoized<Creep>
  private protector: Memoized<Creep>

  constructor(keeper: Creep, protector: Creep) {
    this.keeper = new Memoized(keeper)
    this.protector = new Memoized(protector)
  }

  move(direction: DirectionConstant) {
    console.log('move')
    const keeper = this.keeper.object
    if (keeper && !keeper.fatigue) return false
    const protector = this.protector.object
    if (protector && !protector.fatigue) return false
    if (keeper) keeper.move(direction)
    if (protector) {
      if (keeper) protector.moveTo(keeper)
      else protector.move(direction)
    }
    return true
  }

  moveTo(target: _HasRoomPosition) {
    console.log('move to target')
    const keeper = this.keeper.object
    if (keeper && !keeper.fatigue) return false
    const protector = this.protector.object
    if (protector && !protector.fatigue) return false
    if (keeper) keeper.moveTo(target)
    if (protector) protector.moveTo(keeper || target)
    return true
  }

  arrive(target: string) {
    console.log('arriving')
    const keeper = this.keeper.object
    if (keeper && !keeper.fatigue) return false
    const protector = this.protector.object
    if (protector && !protector.fatigue) return false
    if (keeper) keeper.moveToRoom(target)
    if (protector) {
      if (keeper) protector.moveTo(keeper)
      else protector.moveToRoom(target)
    }
    return true
  }

  heal() {
    console.log('heal')
    const creeps = this.creeps
    const healer = creeps[creeps.length - 1]
    if (!healer) return false
    const toBeHealed = _.max(creeps, (c) => c.hitsMax - c.hits)
    if (healer.pos.isNearTo(toBeHealed)) return healer.heal(toBeHealed) === 0
    return healer.heal(toBeHealed) === 0
  }

  connect() {
    console.log('connecting')
    const keeper = this.keeper.object
    if (!keeper) return false
    const protector = this.protector.object
    if (!protector) return false
    keeper.moveTo(protector)
    protector.moveTo(keeper)
    return true
  }

  destroy() {
    const keeper = this.keeper.object
    if (keeper) keeper.memory.role = Role.DESTROYER
    const protector = this.protector.object
    if (protector) protector.memory.role = Role.TOWER_EKHAUSTER
  }

  attack(target: Structure) {
    console.log('attacking')
    const keeper = this.keeper.object
    if (keeper && target.pos.isNearTo(keeper)) keeper.dismantle(target)
    const protector = this.protector.object
    if (protector) {
      if (
        (keeper && keeper.pos.isNearTo(protector)) ||
        protector.pos.isNearTo(target)
      )
        protector.rangedAttack(target)
      else protector.rangedMassAttack()
    }
  }

  get safe() {
    const creeps = this.creeps
    if (!creeps.length) return true
    const room = creeps[0].room
    const hitCalc = new HitCalculator(room)
    hitCalc.fetch()
    const hostiles = room.find(FIND_HOSTILE_CREEPS)
    const damage = hitCalc.getFor(creeps[0], hostiles, creeps)
    return damage > 0
  }

  get connected() {
    const keeper = this.keeper.object
    const protector = this.protector.object
    if (!keeper || !protector) return false
    return keeper.pos.isNearTo(protector)
  }

  get whole() {
    return !!(this.keeper.object && this.protector.object)
  }

  get pos() {
    const creeps = this.creeps
    return creeps[0] && creeps[0].pos
  }

  get creeps() {
    const creeps: Creep[] = []
    const keeper = this.keeper.object
    if (keeper) creeps.push(keeper)
    const protector = this.protector.object
    if (protector) creeps.push(protector)
    return creeps
  }

  get room() {
    const creeps = this.creeps
    return creeps[0] && creeps[0].room
  }
}
