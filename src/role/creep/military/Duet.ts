import _ from 'lodash'
import Memoized from 'utils/Memoized'
import HitCalculator from 'room/military/HitCalculator'
import move, { offsetsByDirection } from 'utils/path'

export default class Duet {
  private keeper: Memoized<Creep>
  private protector: Memoized<Creep>

  constructor(keeper: Creep, protector: Creep) {
    this.keeper = new Memoized(keeper)
    this.protector = new Memoized(protector)
    keeper.notifyWhenAttacked(false)
    protector.notifyWhenAttacked(false)
  }

  move(direction: DirectionConstant) {
    console.log('move')
    if (this.fatigued) return false
    const keeper = this.keep
    const protector = this.protect
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
    const keeper = this.keep
    const protector = this.protect
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
    const keeper = this.keep
    const protector = this.protect

    const pos = this.pos
    if (!pos) return false
    const dir = pos.getDirectionTo(target)
    const x = pos.x + offsetsByDirection[dir][0]
    const y = pos.y + offsetsByDirection[dir][1]
    const damaged = this.creeps.some((c) => {
      const damage = calc.getDamage(
        new RoomPosition(x, y, pos.roomName),
        enemies,
      )
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
    const keeper = this.keep
    const protector = this.protect
    if (protector) res = protector.moveToRoom(target)
    if (keeper) {
      if (protector) {
        keeper.moveTo(protector)
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

  heal() {
    console.log('heal')
    const creeps = this.creeps
    const healer = creeps[creeps.length - 1]
    if (!healer) return false
    const localCreeps = creeps.filter((c) => c.pos.getRangeTo(healer) <= 3)
    const toBeHealed = _.max(localCreeps, (c) => c.hitsMax - c.hits)
    if (healer.pos.isNearTo(toBeHealed)) return healer.heal(toBeHealed) === 0
    return healer.rangedHeal(toBeHealed) === 0
  }

  connect() {
    const keeper = this.keep
    if (!keeper) return false
    const protector = this.protect
    if (!protector) return false
    console.log('connecting', protector.name, keeper.name)
    if (keeper.pos.getRangeTo(protector) > 1) keeper.moveTo(protector)
    protector.moveTo(keeper)
    return true
  }

  destroy() {
    const keeper = this.keep
    if (keeper && keeper.memory.role === Role.DUAL)
      keeper.memory.role = Role.DESTROYER
    const protector = this.protect
    if (protector && protector.memory.role === Role.DUAL)
      protector.memory.role = Role.TOWER_EKHAUSTER
  }

  attack(target: Structure) {
    console.log('attacking')
    const keeper = this.keep
    if (keeper && target.pos.isNearTo(keeper)) keeper.dismantle(target)
    const protector = this.protect
    if (protector) {
      if (
        (keeper && keeper.pos.isNearTo(protector)) ||
        protector.pos.isNearTo(target)
      )
        protector.rangedAttack(target)
      else protector.rangedMassAttack()
    }
  }

  get atBorder() {
    return this.creeps.some((c) => c.pos.rangeXY(25, 25) > 21)
  }

  get valid() {
    return this.creeps.every((c) => c.memory.role === Role.DUAL)
  }

  get healed() {
    const creeps = this.creeps
    return (
      !creeps.every((c) => c.hits !== c.hitsMax) &&
      creeps.every((c) => c.corpus.hasActive(TOUGH))
    )
  }

  get safe() {
    const creeps = this.creeps
    if (!creeps.length) return true
    const room = creeps[0].room
    const hitCalc = new HitCalculator(room)
    hitCalc.fetch(false)
    const hostiles = room.find(FIND_HOSTILE_CREEPS)
    const damage = hitCalc.getFor(creeps[0], hostiles, creeps)
    return damage <= 0
  }

  get connected() {
    const keeper = this.keep
    const protector = this.protect
    if (!keeper || !protector) return false
    const range = keeper.pos.rangeTo(protector)
    console.log(range)
    if (range > 25 || isNaN(range)) {
      // todo fix when passing through rooms
      return true
    }
    return range <= 1
  }

  get whole() {
    return !!(this.keep && this.protect)
  }

  get pos(): RoomPosition | undefined {
    const creeps = this.creeps
    return creeps[0] && creeps[0].pos
  }

  get keep() {
    return this.keeper.object
  }

  get protect() {
    return this.protector.object
  }

  get creeps() {
    const creeps: Creep[] = []
    const keeper = this.keep
    if (keeper) creeps.push(keeper)
    const protector = this.protect
    if (protector) creeps.push(protector)
    return creeps
  }

  get room() {
    const creeps = this.creeps
    return creeps[0] && creeps[0].room
  }

  private get fatigued() {
    return this.creeps.some((c) => c.fatigue)
  }
}
