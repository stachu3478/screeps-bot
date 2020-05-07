import plan from './core'
import { SUCCESS, NOTHING_TODO } from '../constants/response'

export default function place(room: Room) {
  if (!room.controller) return
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
    else if (iteration < 10) structureToPlace = STRUCTURE_TOWER
    else structureToPlace = STRUCTURE_EXTENSION
    if (room.createConstructionSite(x, y, structureToPlace) === 0) {
      room.memory._struct_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  if (!mem._extractor && CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][room.controller.level]) {
    const extractor = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_EXTRACTOR
    })[0] as StructureExtractor | undefined
    if (!extractor) {
      const mineralPos = room.find(FIND_MINERALS)[0]
      if (mineralPos && mineralPos.pos.createConstructionSite(STRUCTURE_EXTRACTOR) === 0) {
        mem._mineral = mineralPos.id
        return SUCCESS
      }
    } else mem._extractor = extractor.id
  }
  mem._built = true
  return NOTHING_TODO
}
