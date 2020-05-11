import profiler from "screeps-profiler"
import { getXYLink } from "./selectFromPos"

let test1 = () => {
  let linksTotal: Id<StructureLink>[] = []
  for (const name in Game.rooms) {
    const room = Game.rooms[name]
    const links = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK }) as StructureLink[]
    linksTotal = linksTotal.concat(links.map(l => l.id))
  }
  Memory.test = linksTotal
  //console.log("Found using room.find: ", linksTotal)
}

let test2 = () => {
  let linksTotal: Id<StructureLink>[] = []
  for (const name in Game.rooms) {
    const room = Game.rooms[name]
    let linkPoses = ''
    if (room.memory.links) linkPoses += room.memory.links
    if (room.memory.controllerLink) linkPoses += room.memory.controllerLink
    if (room.memory.structs) linkPoses += room.memory.structs[0]
    const links = linkPoses.split('').map(s => {
      const code = s.charCodeAt(0)
      return getXYLink(room, code & 63, code >> 6)
    }).filter(l => l) as StructureLink[]
    linksTotal = linksTotal.concat(links.map(l => l.id))
  }
  Memory.test = linksTotal
  //console.log("Found using positional selector: ", linksTotal)
}

let test3 = () => {
  let links = Memory.test.map(l => Game.getObjectById(l)).filter(l => l) as StructureLink[]
  let linksTotal = links.map(l => l.id)
  Memory.test = linksTotal
}

export const test11 = profiler.registerFN(test1, "find links using room.find")
export const test22 = profiler.registerFN(test2, "find links using positional selector")
export const test33 = profiler.registerFN(test3, "restore links using id on cache")
