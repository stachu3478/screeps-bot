const spawnStyle: PolyStyle = { fill: '#ffff88' }
const linkStyle: PolyStyle = { fill: '#ff8844', stroke: '#000000' }
const storageStyle: PolyStyle = { fill: '#888888' }
const termStyle: PolyStyle = { fill: '#aaaaaa' }
const structStyle: PolyStyle = { fill: '#88ffff' }
const roadStyle: PolyStyle = {
  fill: '#dddddd',
}

const rect45 = (x: number, y: number): [number, number][] => {
  const last: [number, number] = [x + 0.5, y]
  return [last, [x, y + 0.5], [x - 0.5, y], [x, y - 0.5], last]
}

export default function visual(room: Room) {
  const vis = room.visual
  const structs = room.memory.structs
  if (structs) {
    const spawnPos = structs.charCodeAt(0)
    vis.rect((spawnPos & 63) - 0.25, (spawnPos >> 6) - 0.25, 0.5, 0.5, spawnStyle)
    const storagePos = structs.charCodeAt(1)
    vis.rect((storagePos & 63) - 0.25, (storagePos >> 6) - 0.25, 0.5, 0.5, storageStyle)
    const termPos = structs.charCodeAt(2)
    vis.rect((termPos & 63) - 0.25, (termPos >> 6) - 0.25, 0.5, 0.5, termStyle)

    const roadCount = structs.length
    for (let i = 3; i < roadCount; i++) {
      const structPos = structs.charCodeAt(i)

      vis.rect((structPos & 63) - 0.25, (structPos >> 6) - 0.25, 0.5, 0.5, structStyle)
    }
  }

  const roads = room.memory.roads
  if (roads) {
    const roadCount = roads.length
    for (let i = 0; i < roadCount; i++) {
      const roadPos = roads.charCodeAt(i)
      vis.circle(roadPos & 63, roadPos >> 6, roadStyle)
    }
  }

  const links = (room.memory.controllerLink || '') + (room.memory.links || '')
  if (links) {
    const linkCount = links.length
    for (let i = 0; i < linkCount; i++) {
      const linkPos = links.charCodeAt(i)
      const x = linkPos & 63
      const y = linkPos >> 6
      vis.poly(rect45(linkPos & 63, linkPos >> 6), linkStyle)
    }
  }
}
