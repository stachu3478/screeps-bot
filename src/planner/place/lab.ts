import { SUCCESS, NOTHING_TODO, NOTHING_DONE } from '../../constants/response'
import charPosIterator from 'utils/charPosIterator';

export default function placeLab(room: Room, labs: string) {
  return charPosIterator(labs, (x, y): number | void => {
    const result = room.createConstructionSite(x, y, STRUCTURE_LAB)
    if (result === ERR_RCL_NOT_ENOUGH) return NOTHING_TODO
    if (result === ERR_INVALID_TARGET) {
      const structure = room.lookForAt(LOOK_STRUCTURES, x, y)[0]
      if (structure && structure.structureType !== STRUCTURE_LAB) {
        structure.destroy()
        return NOTHING_DONE
      }
    }
    if (result === 0) return SUCCESS
  })
}
