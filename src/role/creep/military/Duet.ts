import _ from 'lodash'
import HitCalculator from 'room/military/HitCalculator'
import move from 'utils/path'
import CreepSquad from './CreepSquad'

export default class Duet extends CreepSquad {
  constructor(keeper: Creep, protector: Creep) {
    super([keeper, protector])
  }

  move(direction: DirectionConstant) {
    console.log('move')
    if (this.fatigued) return false
    const keeper = this.keeper
    const protector = this.protector
    if (keeper) keeper.move(direction)
    if (protector) {
      if (keeper) protector.moveTo(keeper)
      else protector.move(direction)
    }
    return true
  }

  moveTo(target: _HasRoomPosition) {
    console.log('move to target')
    if (this.fatigued) return false
    let res = -1
    const keeper = this.keeper
    const protector = this.protector
    if (keeper) res = move.cheap(keeper, target)
    if (protector) {
      if (keeper && !keeper?.pos.isBorder()) protector.moveTo(keeper)
      else res = protector.moveTo(target)
    }
    console.log(res)
    return true
  }

  moveToWithSafety(
    target: _HasRoomPosition,
    calc: HitCalculator,
    enemies: Creep[],
  ) {
    console.log('move to target')
    if (this.fatigued) return false
    let res = -1
    const keeper = this.keeper
    const protector = this.protector

    const pos = this.pos
    if (!pos) return false
    const dir = pos.getDirectionTo(target)
    const offsetPos = pos.offset(dir)
    const damaged = this.validCreeps.some((c) => {
      const damage = calc.getDamage(offsetPos, enemies)
      const dealt =
        c.corpus.damageDealt(damage) - (protector?.corpus.healPower || 0)
      return dealt > 0
    })
    if (damaged) return false

    if (keeper) res = move.cheap(keeper, target)
    if (protector) {
      if (keeper && !keeper?.pos.isBorder()) protector.moveTo(keeper)
      else res = protector.moveTo(target)
    }
    console.log(res)
    return true
  }

  arrive(target: string) {
    let res: ScreepsReturnCode = -1
    if (this.fatigued) return false
    const keeper = this.keeper
    const protector = this.protector
    if (protector) res = protector.moveToRoom(target)
    if (keeper) {
      if (protector) {
        if (keeper.pos.isNearTo(keeper)) {
          keeper.moveTo(protector)
        } else {
          move.cheap(keeper, protector)
        }
        if (protector.room.name !== keeper.room.name) {
          move.anywhere(protector, protector.pos.getDirectionTo(25, 25))
        }
      } else {
        res = keeper.moveToRoom(target)
      }
    }
    console.log('arriving', target, res)
    return true
  }

  connect() {
    const keeper = this.keeper
    if (!keeper) return false
    const protector = this.protector
    if (!protector) return false
    console.log('connecting', protector.name, keeper.name)
    if (keeper.pos.getRangeTo(protector) > 1) keeper.moveTo(protector)
    protector.moveTo(keeper)
    return true
  }

  destroy() {
    const keeper = this.keeper
    if (keeper && keeper.memory.role === Role.DUAL)
      keeper.memory.role = Role.DESTROYER
    const protector = this.protector
    if (protector && protector.memory.role === Role.DUAL)
      protector.memory.role = Role.TOWER_EKHAUSTER
  }

  attack(target: Structure) {
    console.log('attacking')
    const keeper = this.keeper
    if (keeper && target.pos.isNearTo(keeper)) keeper.dismantle(target)
    const protector = this.protector
    if (protector) {
      if (
        (keeper && keeper.pos.isNearTo(protector)) ||
        protector.pos.isNearTo(target)
      )
        protector.rangedAttack(target)
      else protector.rangedMassAttack()
    }
  }

  get valid() {
    return this.validCreeps.every((c) => c.memory.role === Role.DUAL)
  }

  get safe() {
    const creeps = this.validCreeps
    if (!creeps.length || creeps.some((c) => c.pos.isBorder())) return true
    const room = creeps[0].room
    const hitCalc = new HitCalculator(room)
    hitCalc.fetch(false)
    const hostiles = room.find(FIND_HOSTILE_CREEPS)
    const damage = hitCalc.getFor(creeps[0], hostiles, creeps)
    return damage <= 0
  }

  get connected() {
    const keeper = this.keeper
    const protector = this.protector
    if (!keeper || !protector) return false
    const range = keeper.pos.rangeTo(protector)
    console.log(range)
    if (
      range > 25 ||
      isNaN(range) ||
      keeper?.pos.isBorder() ||
      protector?.pos.isBorder()
    ) {
      // todo fix when passing through rooms
      return true
    }
    return range <= 1
  }

  get pos(): RoomPosition | undefined {
    const creeps = this.validCreeps
    return creeps[0] && creeps[0].pos
  }

  get keeper() {
    return this.creeps[0].object
  }

  get protector() {
    return this.creeps[1].object
  }

  get room() {
    const creeps = this.validCreeps
    return creeps[0] && creeps[0].room
  }
}
