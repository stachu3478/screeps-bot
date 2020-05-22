import plan from '../core'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE } from '../../constants/response'
import { findExtractors } from 'utils/find';
import planLabs from '../planLabs';
import placeLink from './link';

export default function place(room: Room) {
  if (!room.controller) return NOTHING_TODO
  const mem = room.memory
  if (mem._built) return NOTHING_TODO
  if (!mem.structs) plan(room)
  mem.structs = mem.structs || ''
  const times = mem.structs.length
  let iteration = room.memory._struct_iteration || 0
  for (let i = 0; i < times; i++) {
    const xy = mem.structs.charCodeAt(iteration)
    const x = xy & 63
    const y = xy >> 6
    let structureToPlace: StructureConstant
    if (iteration === 0) structureToPlace = STRUCTURE_LINK
    else if (iteration === 1) structureToPlace = STRUCTURE_SPAWN
    else if (iteration === 2) structureToPlace = STRUCTURE_STORAGE
    else if (iteration === 3) structureToPlace = STRUCTURE_TERMINAL
    else if (iteration === 4) structureToPlace = STRUCTURE_FACTORY
    else if (iteration < 11) structureToPlace = STRUCTURE_TOWER
    else if (iteration === 11) structureToPlace = STRUCTURE_POWER_SPAWN
    else structureToPlace = STRUCTURE_EXTENSION
    if (room.createConstructionSite(x, y, structureToPlace) === 0) {
      room.memory._struct_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  if (!mem._extractor && CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][room.controller.level]) {
    const extractor = findExtractors(room)[0]
    if (!extractor) {
      const mineralPos = room.find(FIND_MINERALS)[0]
      if (mineralPos && mineralPos.pos.createConstructionSite(STRUCTURE_EXTRACTOR) === 0) {
        mem._mineral = mineralPos.id
        return SUCCESS
      }
    } else mem._extractor = extractor.id
  }
  if (placeLink(room, mem)) return SUCCESS

  if (mem.internalLabs && mem.externalLabs) {
    const internal = mem.internalLabs + mem.externalLabs
    const internalCount = internal.length
    for (let i = 0; i < internalCount; i++) {
      const pos = internal.charCodeAt(i)
      const result = room.createConstructionSite(pos & 63, pos >> 6, STRUCTURE_LAB)
      if (result === ERR_RCL_NOT_ENOUGH) break
      if (result === ERR_INVALID_TARGET) {
        const structure = room.lookForAt(LOOK_STRUCTURES, pos & 63, pos >> 6)[0]
        if (structure && structure.structureType !== STRUCTURE_LAB) {
          structure.destroy()
          return NOTHING_DONE
        }
      }
      if (result === 0) return SUCCESS
    }
  } else {
    planLabs.run(room)
    return NOTHING_DONE
  }

  mem._built = true
  return NOTHING_TODO
}
