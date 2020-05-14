const spawnStyle: CircleStyle = { stroke: '#000000', strokeWidth: 0.15, radius: 0.5, fill: '#0000' }
const extStyle: CircleStyle = { stroke: '#000000', radius: 0.25, fill: '#0000' }
const linkStyle: PolyStyle = { stroke: '#000000', fill: '#0000' }
const storageStyle: PolyStyle = { fill: '#888888' }
const termStyle: PolyStyle = { fill: '#aaaaaa' }
const structStyle: PolyStyle = { fill: '#88ffff' }
const roadStyle: PolyStyle = {
  fill: '#dddddd',
}

const rect45 = (x: number, y: number): [number, number][] => {
  const last: [number, number] = [x + 0.25, y]
  return [last, [x, y + 0.37], [x - 0.25, y], [x, y - 0.37], last]
}

export default function visual(room: Room) {
  const vis = room.visual
  const structs = room.memory.structs
  if (structs) {
    const linkPos = structs.charCodeAt(0)
    vis.poly(rect45(linkPos & 63, linkPos >> 6), linkStyle)
    const spawnPos = structs.charCodeAt(1)
    vis.circle(spawnPos & 63, spawnPos >> 6, spawnStyle)
    const storagePos = structs.charCodeAt(2)
    vis.rect((storagePos & 63) - 0.25, (storagePos >> 6) - 0.25, 0.5, 0.5, storageStyle)
    const termPos = structs.charCodeAt(3)
    vis.rect((termPos & 63) - 0.25, (termPos >> 6) - 0.25, 0.5, 0.5, termStyle)

    const structCount = structs.length
    for (let i = 4; i < structCount; i++) {
      const structPos = structs.charCodeAt(i)

      vis.circle(structPos & 63, structPos >> 6, extStyle)
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
