const spawnStyle: CircleStyle = { stroke: '#000', strokeWidth: 0.15, radius: 0.5, fill: '#0000' }
const extStyle: CircleStyle = { stroke: '#000', radius: 0.25, fill: '#0000' }
const towerStyle: CircleStyle = { stroke: '#8af4', strokeWidth: 0.15, radius: 0.5, fill: '#0000' }
const linkStyle: PolyStyle = { stroke: '#000', fill: '#0000' }
const storageStyle: PolyStyle = { fill: '#888888' }
const internalLabStyle: CircleStyle = { stroke: '#800', fill: '#8004', radius: 0.4 }
const externalLabStyle: CircleStyle = { stroke: '#008', fill: '#0084', radius: 0.4 }
const termStyle: PolyStyle = { fill: '#aaaaaa' }
const factoryStyle: PolyStyle = { stroke: '#000', fill: '#0000', strokeWidth: 0.15 }
const roadStyle: PolyStyle = {
  fill: '#ccc',
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
    const factoryPos = structs.charCodeAt(4)
    vis.rect((factoryPos & 63) - 0.5, (factoryPos >> 6) - 0.5, 1, 1, factoryStyle)

    const structCount = structs.length
    for (let i = 5; i < structCount; i++) {
      const structPos = structs.charCodeAt(i)

      if (i < 11) vis.circle(structPos & 63, structPos >> 6, towerStyle)
      else vis.circle(structPos & 63, structPos >> 6, extStyle)
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
      vis.poly(rect45(linkPos & 63, linkPos >> 6), linkStyle)
    }
  }

  const internalLabs = room.memory.internalLabs
  if (internalLabs) {
    const count = internalLabs.length
    for (let i = 0; i < count; i++) {
      const pos = internalLabs.charCodeAt(i)
      vis.circle(pos & 63, pos >> 6, internalLabStyle)
    }
  }

  const externalLabs = room.memory.externalLabs
  if (externalLabs) {
    const count = externalLabs.length
    for (let i = 0; i < count; i++) {
      const pos = externalLabs.charCodeAt(i)
      vis.circle(pos & 63, pos >> 6, externalLabStyle)
    }
  }
}
