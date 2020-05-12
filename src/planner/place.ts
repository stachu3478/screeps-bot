import plan from './core'
import { SUCCESS, NOTHING_TODO } from '../constants/response'
import { roomPos } from './pos';
import _ from 'lodash';
import { findExtractors } from 'utils/find';
import { getLink } from 'utils/selectFromPos';

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
    else if (iteration === 4) structureToPlace = STRUCTURE_LAB
    else if (iteration < 11) structureToPlace = STRUCTURE_TOWER
    else structureToPlace = STRUCTURE_EXTENSION
    if (room.createConstructionSite(x, y, structureToPlace) === 0) {
      room.memory._struct_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  if (!mem._extractor && CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][room.controller.level]) {
    const extractor = findExtractors(room)[0] as StructureExtractor | undefined
    if (!extractor) {
      const mineralPos = room.find(FIND_MINERALS)[0]
      if (mineralPos && mineralPos.pos.createConstructionSite(STRUCTURE_EXTRACTOR) === 0) {
        mem._mineral = mineralPos.id
        return SUCCESS
      }
    } else mem._extractor = extractor.id
  }
  if (mem.controllerLink && mem.links) {
    const linkPoses = mem.controllerLink + mem.links
    const linkCount = linkPoses.length
    let linked: 0 | 1 = 1
    for (let i = 0; i < linkCount; i++) {
      const linkPos = roomPos(linkPoses[i], room.name)
      const link = getLink(linkPos)
      if (link) continue
      const result = linkPos.createConstructionSite(STRUCTURE_LINK)
      if (result === ERR_RCL_NOT_ENOUGH) break
      if (result === 0) return SUCCESS
      linked = 0
    }
    mem._linked = linked
  }
  mem._built = true
  return NOTHING_TODO
}
