import _ from 'lodash'
import { doTransferFor, doWithdrawFor } from 'overloads/creep/Creep'
import defineGetter from 'utils/defineGetter'
import PowerCreepCorpus from './PowerCreepCorpus'

function definePowerCreepGetter<T extends keyof PowerCreep>(
  property: T,
  handler: (self: PowerCreep) => PowerCreep[T],
) {
  defineGetter<PowerCreep, PowerCreepConstructor, T>(
    PowerCreep,
    property,
    handler,
  )
}

function memoizeByPowerCreep<T>(fn: (c: PowerCreep) => T) {
  return _.memoize(fn, (c: PowerCreep) => c.id)
}

PowerCreep.prototype._transfer = PowerCreep.prototype.transfer
PowerCreep.prototype.transfer = function (
  t: Structure | AnyCreep,
  r: ResourceConstant,
  a?: number,
) {
  return doTransferFor(this, t, r, a)
}

PowerCreep.prototype._withdraw = PowerCreep.prototype.withdraw
PowerCreep.prototype.withdraw = function (
  t: Structure | Tombstone | Ruin,
  r: ResourceConstant,
  a?: number,
) {
  return doWithdrawFor(this, t, r, a)
}

const powerCreepCorpus = memoizeByPowerCreep((c) => new PowerCreepCorpus(c))
definePowerCreepGetter('corpus', (self) => powerCreepCorpus(self))
