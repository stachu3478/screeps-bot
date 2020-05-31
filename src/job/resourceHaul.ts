import { ACCEPTABLE } from "constants/response";
import { PICK, RECYCLE, ARRIVE, DRAW } from "constants/state";
import pick from "routine/haul/pick";
import Hauler from 'role/creep/hauler.d'
import { findHaulable } from "utils/find";
import { HARVESTER } from "constants/role";

function getHaulable(structure?: StructureStorage | StructureTerminal) {
  return structure && structure.store.getUsedCapacity() && structure
}

export default function resourceHaul(creep: Hauler) {
  const mem = creep.memory
  const haulTarget = Memory.rooms[mem.room]._haul
  if (!haulTarget) {
    if (mem._tmp) mem.role = HARVESTER
    else mem.state = RECYCLE
    return true
  } else if (haulTarget === creep.room.name) {
    if (pick(creep) in ACCEPTABLE) {
      mem.state = PICK
      return true
    }
    const room = creep.room
    const haulable = findHaulable(room, creep.pos) || (room.controller && !room.controller.my && (getHaulable(room.storage) || getHaulable(room.terminal)))
    if (haulable) {
      mem.state = DRAW
      mem._draw = haulable.id
      mem._drawType = RESOURCES_ALL.find(resource => !!haulable.store[resource])
      return true
    }
    mem.state = ARRIVE
    mem._arrive = mem.room
    delete Memory.rooms[mem.room]._haul
    return false
  } else {
    mem.state = ARRIVE
    mem._arrive = haulTarget
  }
  return false
}
