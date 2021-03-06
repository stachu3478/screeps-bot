import { ACCEPTABLE } from 'constants/response'
import pick from 'routine/haul/pick'
import Hauler from 'role/creep/hauler.d'
import { findHaulable } from 'utils/find'
import { getFillableGenericStruture } from 'utils/fill'
import { freeStorageToHaulThreshold } from 'config/storage'

function getHaulable(structure?: StructureStorage | StructureTerminal) {
  return structure && structure.store.getUsedCapacity() && structure
}

export function haulCurrentRoom(creep: Hauler) {
  const mem = creep.memory
  if (creep.store.getFreeCapacity() === 0) {
    return false
  }
  const storage = getFillableGenericStruture(
    creep.motherRoom,
    freeStorageToHaulThreshold,
  ) // why was only storage
  if (!storage) {
    return false
  }
  if (pick(creep) in ACCEPTABLE) {
    mem.state = State.PICK
    return true
  }
  const room = creep.room
  const haulable =
    findHaulable(room, creep.pos) ||
    (!room.my && (getHaulable(room.storage) || getHaulable(room.terminal)))
  if (haulable) {
    mem.state = State.DRAW
    mem._draw = haulable.id
    mem._drawType = RESOURCES_ALL.reverse().find(
      (resource) => !!haulable.store[resource],
    )
    return true
  }
  return false
}

export default function resourceHaul(creep: Hauler) {
  const mem = creep.memory
  const haulTarget = creep.motherRoom.memory._haul
  if (creep.store.getFreeCapacity() === 0) {
    creep.memory.state = State.ARRIVE_BACK
  } else if (!haulTarget) {
    mem.state = State.RECYCLE
  } else if (haulTarget === creep.room.name) {
    const hauling = haulCurrentRoom(creep)
    if (!hauling) {
      mem.state = State.ARRIVE
      mem._arrive = mem.room
      delete creep.motherRoom.memory._haul
    }
    return hauling
  } else {
    mem.state = State.ARRIVE
    mem._arrive = haulTarget
  }
  return false
}
