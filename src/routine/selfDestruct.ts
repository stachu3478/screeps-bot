import { SUCCESS, NOTHING_TODO, FAILED, DONE } from '../constants/response'

export default function selfDestruct(creep: Creep) {
  const structs = creep.room.find(FIND_HOSTILE_STRUCTURES)
  if (structs[0]) {
    if (structs[0].destroy() !== 0) return FAILED
    if (structs[1]) return SUCCESS
    return DONE
  }
  return NOTHING_TODO
}
