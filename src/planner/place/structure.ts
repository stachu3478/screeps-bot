import _ from 'lodash'
import { SUCCESS, NOTHING_TODO } from '../../constants/response'
import { getXYExtension } from 'utils/selectFromPos';
import charPosIterator from 'utils/charPosIterator';

export default function placeStructure(controller: StructureController, structs: string) {
  const room = controller.room
  const result = charPosIterator(structs, (x, y, _xy, _, iteration): number | void => {
    let structureToPlace: StructureConstant
    if (iteration === 0) structureToPlace = STRUCTURE_LINK
    else if (iteration === 1) structureToPlace = STRUCTURE_SPAWN
    else if (iteration === 2) structureToPlace = STRUCTURE_STORAGE
    else if (iteration === 3) structureToPlace = STRUCTURE_TERMINAL
    else if (iteration === 4) structureToPlace = STRUCTURE_FACTORY
    else if (iteration < 11) structureToPlace = STRUCTURE_TOWER
    else if (iteration === 11) structureToPlace = STRUCTURE_POWER_SPAWN
    else if (iteration === 12) structureToPlace = STRUCTURE_NUKER
    else if (iteration < 15) structureToPlace = STRUCTURE_SPAWN
    else structureToPlace = STRUCTURE_EXTENSION
    if (iteration < 15) {
      const extension = getXYExtension(room, x, y)
      if (extension) extension.destroy()
    }
    if (room.createConstructionSite(x, y, structureToPlace) === 0) {
      room.memory._struct_iteration = iteration
      return SUCCESS
    }
  })
  if (_.isUndefined(result))
    return NOTHING_TODO
  return result
}
