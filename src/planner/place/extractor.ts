import { SUCCESS, NOTHING_TODO } from '../../constants/response'

export default function placeExtractor(controller: StructureController) {
  const room = controller.room
  if (!CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][controller.level]) return NOTHING_TODO
  const extractor = room.extractor
  if (extractor) return NOTHING_TODO
  const mineral = room.mineral
  if (mineral && mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR) === OK) return SUCCESS

  return NOTHING_TODO
}
