import { ACCEPTABLE } from "constants/response";
import { PICK, RECYCLE, ARRIVE, DRAW } from "constants/state";
import pick from "routine/haul/pick";
import Hauler from 'role/creep/hauler.d'
import { findHaulable } from "utils/find";

export default function resourceHaul(creep: Hauler) {
  const haulTarget = Memory.rooms[creep.memory.room]._haul
  if (!haulTarget) {
    creep.memory.state = RECYCLE
    return true
  } else if (haulTarget === creep.room.name) {
    if (pick(creep) in ACCEPTABLE) {
      creep.memory.state = PICK
      return true
    }
    const haulable = findHaulable(creep.room, creep.pos) || (creep.room.controller && !creep.room.controller.my && (creep.room.storage || creep.room.terminal))
    if (haulable) {
      creep.memory.state = DRAW
      creep.memory._draw = haulable.id
      creep.memory._drawType = RESOURCES_ALL.find(resource => !!haulable.store[resource])
      return true
    }
    creep.memory.state = ARRIVE
    creep.memory._arrive = creep.memory.room
    delete Memory.rooms[creep.memory.room]._haul
    return false
  } else {
    creep.memory.state = ARRIVE
    creep.memory._arrive = haulTarget
  }
  return false
}
