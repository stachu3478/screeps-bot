import { SUCCESS, NOTHING_TODO, NOTHING_DONE } from '../../constants/response'

export default function placeLab(room: Room, labs: string) {
  const internalCount = labs.length
  for (let i = 0; i < internalCount; i++) {
    const pos = labs.charCodeAt(i)
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

  return NOTHING_TODO
}
