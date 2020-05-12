import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../../constants/response'
import { roomPos, posToChar } from '../../planner/pos'
import { findNearDroppedEnergy, findNearEnergyTombstones } from 'utils/find';

interface AutoPickCreep extends Creep {
  memory: AutoPickMemory
}

interface AutoPickMemory extends CreepMemory {
  _pick_pos?: string
}

export default function autoPick(creep: AutoPickCreep) {
  let remaining = creep.store.getFreeCapacity(RESOURCE_ENERGY)
  if (remaining === 0) return NOTHING_TODO
  const mem = creep.memory
  if (mem._pick_pos && roomPos(mem._pick_pos, creep.room.name).isNearTo(creep)) return DONE
  let result
  let tomb: Tombstone
  let drop = findNearDroppedEnergy(creep.pos)[0]
  if (!drop) {
    tomb = findNearEnergyTombstones(creep.pos)[0]
    if (tomb) {
      result = creep.withdraw(tomb, RESOURCE_ENERGY)
      remaining -= tomb.store[RESOURCE_ENERGY]
    } else {
      mem._pick_pos = posToChar(creep.pos)
      return NOTHING_TODO
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
}
