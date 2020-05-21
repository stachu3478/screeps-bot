import profiler from 'screeps-profiler'
import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../../constants/response'
import { posToChar } from '../../planner/pos'
import { findNearDroppedEnergy, findNearEnergyTombstones, findNearEnergyRuins } from 'utils/find';

interface AutoPickCreep extends Creep {
  memory: AutoPickMemory
}

interface AutoPickMemory extends CreepMemory {
  _pick_pos?: string
}

export default profiler.registerFN(function autoPick(creep: AutoPickCreep) {
  let remaining = creep.store.getFreeCapacity(RESOURCE_ENERGY)
  if (remaining === 0) return NOTHING_TODO
  const mem = creep.memory
  if (mem._pick_pos) {
    const pickPos = mem._pick_pos.charCodeAt(0)
    if (Math.max(Math.abs((pickPos & 63) - creep.pos.x), Math.abs((pickPos >> 6) - creep.pos.y)) < 2) return DONE
  }
  let result
  let ruin: Ruin
  let tomb: Tombstone
  let drop = findNearDroppedEnergy(creep.pos)[0]
  if (!drop) {
    tomb = findNearEnergyTombstones(creep.pos)[0]
    if (!tomb) {
      ruin = findNearEnergyRuins(creep.pos)[0]
      if (!ruin) {
        mem._pick_pos = posToChar(creep.pos)
        return NOTHING_TODO
      } else {
        result = creep.withdraw(ruin, RESOURCE_ENERGY)
        remaining -= ruin.store[RESOURCE_ENERGY]
      }
    } else {
      result = creep.withdraw(tomb, RESOURCE_ENERGY)
      remaining -= tomb.store[RESOURCE_ENERGY]
    }
  } else {
    result = creep.pickup(drop)
    remaining -= drop.amount
  }

  if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'autoPickRoutine')
