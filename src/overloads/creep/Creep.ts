import _ from 'lodash'
import defineGetter from 'utils/defineGetter'
import ResourceRouteProcessor from 'job/resourceRoute/ResourceRouteProcessor'
import BuildingRouteProcessor from 'job/buildingRoute/BuildingRouteProcessor'
import RepairRouteProcessor from 'job/repairRoute/RepairRouteProcessor'
import move from 'utils/path'
import CreepCorpus from './CreepCorpus'
import { findTargets } from 'routine/military/shared'
import { CREEP_RANGE } from 'constants/support'

function defineCreepGetter<T extends keyof Creep>(
  property: T,
  handler: (self: Creep) => Creep[T],
) {
  defineGetter<Creep, CreepConstructor, T>(Creep, property, handler)
}

function memoizeByCreep<T>(fn: (c: Creep) => T) {
  return _.memoize(fn, (c: Creep) => c.id)
}

const creepCache = memoizeByCreep(() => ({}))
defineCreepGetter('cache', (self) => creepCache(self))

defineCreepGetter('motherRoom', (self) => {
  return Game.rooms[self.memory.room] || self.room
})

defineCreepGetter('isRetired', (self) => {
  return (
    (self.ticksToLive || CREEP_LIFE_TIME) <=
    self.body.length * CREEP_SPAWN_TIME + self.memory.deprivity
  )
})

const creepRouteProcessor = memoizeByCreep((c) => new ResourceRouteProcessor(c))
defineCreepGetter('routeProcessor', (self) => creepRouteProcessor(self))

const creepBuildingRouteProcessor = memoizeByCreep(
  (c) => new BuildingRouteProcessor(c),
)
defineCreepGetter('buildingRouteProcessor', (self) =>
  creepBuildingRouteProcessor(self),
)

const creepRepairRouteProcessor = memoizeByCreep(
  (c) => new RepairRouteProcessor(c),
)
defineCreepGetter('repairRouteProcessor', (self) =>
  creepRepairRouteProcessor(self),
)

const creepCorpus = memoizeByCreep((c) => new CreepCorpus(c))
defineCreepGetter('corpus', (self) => creepCorpus(self))

Creep.prototype.isSafeFrom = function (creep: AnyCreep) {
  return this.pos.getRangeTo(creep) > creep.corpus.safeDistance
}

Creep.prototype.safeRangeXY = function (x: number, y: number) {
  return this.pos.rangeXY(x, y) - this.corpus.safeDistance
}

Creep.prototype.moveToRoom = function (room: string) {
  let target = this.memory[Keys.roomPath]
  if (!target || target[0] !== this.room.name || target[1] !== room) {
    const pathStep = this.room.location.findRoomPathStep(this.room.name, room)
    if (!pathStep) return ERR_NOT_FOUND
    target = this.memory[Keys.roomPath] = [this.room.name, room, pathStep]
  }
  const roomPathStep = target[2]
  const pos = new RoomPosition(
    roomPathStep.x,
    roomPathStep.y,
    roomPathStep.name,
  )
  return move.cheap(this, pos, true, undefined, 1)
}

export function doTransferFor(
  creep: AnyCreep,
  t: Structure | AnyCreep,
  r: ResourceConstant,
  a?: number,
) {
  const res = creep._transfer(t, r, a)
  if (res === OK || res === ERR_FULL) {
    const s = t as AnyStoreStructure
    const transfered =
      a || Math.min(s.store.getFreeCapacity(r) || 0, creep.store[r])
    t.onTransfer(transfered)
  }
  return res
}

Creep.prototype._transfer = Creep.prototype.transfer
Creep.prototype.transfer = function (
  t: Structure | AnyCreep,
  r: ResourceConstant,
  a?: number,
) {
  return doTransferFor(this, t, r, a)
}

export function doWithdrawFor(
  creep: AnyCreep,
  t: Structure | Tombstone | Ruin,
  r: ResourceConstant,
  a?: number,
) {
  const res = creep._withdraw(t, r, a)
  if (res === OK || res === ERR_NOT_ENOUGH_RESOURCES) {
    const s = t as AnyStoreStructure
    const transfered =
      a || Math.min(s.store[r] || 0, creep.store.getFreeCapacity(r))
    t.onWithdraw(transfered)
  }
  return res
}

Creep.prototype._withdraw = Creep.prototype.withdraw
Creep.prototype.withdraw = function (
  t: Structure | Tombstone | Ruin,
  r: ResourceConstant,
  a?: number,
) {
  return doWithdrawFor(this, t, r, a)
}

Creep.prototype._rangedHeal = Creep.prototype.rangedHeal
Creep.prototype.rangedHeal = function (t) {
  if (this.cache.lastRangedHealPerformed === Game.time) {
    return OK
  }
  const res = this._rangedHeal(t)
  if (res === OK) {
    this.cache.lastRangedHealPerformed = Game.time
  }
  return res
}

Creep.prototype.dismantleOrAttack = function (t) {
  if (t instanceof Structure && this.corpus.hasActive(WORK)) {
    return this.dismantle(t)
  }
  return this.attack(t)
}

Creep.prototype.autoHeal = function () {
  const creeps = this.pos.findInRange(FIND_MY_CREEPS, CREEP_RANGE)
  const nearCreeps = creeps.filter((c) => c.pos.isNearTo(this))
  const nearCreepToHeal = _.min(nearCreeps, (c) => c.hits - c.hitsMax)
  if (!nearCreepToHeal.corpus.healthy) {
    this.heal(nearCreepToHeal)
    return
  }
  const creepToHeal = _.min(nearCreeps, (c) => c.hits - c.hitsMax)
  if (!creepToHeal.corpus.healthy) {
    this.heal(creepToHeal)
    return
  }
  this.heal(this)
}

Creep.prototype.autoAttack = function () {
  const target = findTargets(this, (c) => c.pos.isNearTo(this))[0]
  if (target) {
    this.attack(target)
  }
}

Creep.prototype.autoRangedAttack = function () {
  const targets = findTargets(this, (t) => t.pos.rangeTo(this) <= CREEP_RANGE)
  if (!targets.length) {
    return
  }
  const corpus = this.corpus
  const massAttackEffect = _.sum(targets, (t) =>
    corpus.rangedMassAttackPowerAt(t),
  )
  if (massAttackEffect < RANGED_ATTACK_POWER) {
    this.rangedAttack(targets[0])
  } else {
    this.rangedMassAttack()
  }
}

Creep.prototype.autoDismantleOrAttack = function () {
  const target = findTargets(this, (c) => c.pos.isNearTo(this))[0]
  if (target) {
    this.dismantleOrAttack(target)
  }
}
