import _ from 'lodash'
import { getLink } from "./selectFromPos";
import storageConfig from 'config/storage'
import linkConfig from 'config/link'

export default function maintainControllerLink(room: Room, drawAmount: number = 0) {
  const linkPos = room.memory.controllerLink
  if (!linkPos) return false
  const link = getLink(room, linkPos.charCodeAt(0))
  if (!link) return false
  let canDrawLink = false
  if (link.store[RESOURCE_ENERGY] < drawAmount) {
    let linkPoses = room.memory.links
    if (room.memory.structs && room.storage && room.storage.store[RESOURCE_ENERGY] > storageConfig.energyToUpgradeThreshold) linkPoses += room.memory.structs[0]
    if (linkPoses) {
      const links = linkPoses.split('').map(p => getLink(room, p.charCodeAt(0))).filter(l => l) as StructureLink[]
      if (links.length) {
        const bestLink = _.max(links, l => l.cooldown ? -1 : l.store[RESOURCE_ENERGY])
        if (bestLink.store[RESOURCE_ENERGY] > linkConfig.energyToUpgradeThreshold) {
          bestLink.transferEnergy(link)
          return link.id
        }
      }
    }
  }
  if (link.store[RESOURCE_ENERGY] || canDrawLink) return link.id
  return false
}
