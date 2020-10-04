import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../constants/response'

interface DestructCreep extends Creep {
  memory: DestructMemory
}

interface DestructMemory extends CreepMemory {}

export default function selfDestruct(creep: DestructCreep) {
  const structs = creep.room.find(FIND_HOSTILE_STRUCTURES)
  if (structs[0]) {
    if (structs[0].destroy() !== 0) return FAILED
    if (structs[1]) return SUCCESS
    return DONE
  }
  return NOTHING_TODO
}
