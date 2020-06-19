import { SUCCESS, NOTHING_TODO } from '../../constants/response'

export default function placeExtractor(controller: StructureController) {
  const room = controller.room
  const mem = room.memory
  if (!mem._extractor && CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][controller.level]) {
    const extractor = room.extractor
    if (!extractor) {
      const mineralPos = room.mineral
      if (mineralPos && mineralPos.pos.createConstructionSite(STRUCTURE_EXTRACTOR) === 0) return SUCCESS
    } else mem._extractor = extractor.id
  }

  return NOTHING_TODO
}
