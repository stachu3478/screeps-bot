import { getXYLink } from "utils/selectFromPos";

export default function placeLink(room: Room, mem: RoomMemory) {
  if (mem.controllerLink && mem.links) {
    const linkPoses = mem.controllerLink + mem.links
    const linkCount = linkPoses.length
    let linked: 0 | 1 = 1
    for (let i = 0; i < linkCount; i++) {
      const pos = linkPoses.charCodeAt(i)
      const x = pos & 63
      const y = pos >> 6
      const link = getXYLink(room, x, y)
      if (link) continue
      linked = 0
      const result = room.createConstructionSite(x, y, STRUCTURE_LINK)
      if (result === ERR_RCL_NOT_ENOUGH) break
      if (result === 0) return true
    }
    mem._linked = linked
  }
  return false
}
