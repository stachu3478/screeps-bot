import { getXYLink } from "utils/selectFromPos";
import charPosIterator from "utils/charPosIterator";

export default function placeLink(room: Room) {

  const mem = room.memory
  if (mem.controllerLink && mem.links) {
    charPosIterator(mem.controllerLink + mem.links, (x, y): boolean | void => {
      const link = getXYLink(room, x, y)
      if (link) return
      else console.log('link not found')
      const result = room.createConstructionSite(x, y, STRUCTURE_LINK)
      if (result === ERR_RCL_NOT_ENOUGH) return false
      if (result === 0) return true
    })
  }
  return false
}
