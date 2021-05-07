import charPosIterator from 'utils/charPosIterator'

const spawnStyle: CircleStyle = {
  stroke: '#000',
  strokeWidth: 0.15,
  radius: 0.5,
  fill: '#0000',
}
const extStyle: CircleStyle = { stroke: '#000', radius: 0.25, fill: '#0000' }
const shieldStyle: CircleStyle = { stroke: '#0f04', radius: 0.5, fill: '#0a04' }
const towerStyle: CircleStyle = {
  stroke: '#8af4',
  strokeWidth: 0.15,
  radius: 0.5,
  fill: '#0000',
}
const linkStyle: PolyStyle = { stroke: '#000', fill: '#0000' }
const storageStyle: PolyStyle = { fill: '#888888' }
const internalLabStyle: CircleStyle = {
  stroke: '#800',
  fill: '#8004',
  radius: 0.4,
}
const externalLabStyle: CircleStyle = {
  stroke: '#008',
  fill: '#0084',
  radius: 0.4,
}
const termStyle: PolyStyle = { fill: '#aaaaaa' }
const factoryStyle: PolyStyle = {
  stroke: '#000',
  fill: '#0000',
  strokeWidth: 0.15,
}
const roadStyle: PolyStyle = { fill: '#ccc' }

export const polyRect = (points: [number, number][]) => {
  return [points[0], points[1], points[2], points[3], points[0]]
}

const rect45 = (x: number, y: number): [number, number][] => {
  const last: [number, number] = [x + 0.25, y]
  return [last, [x, y + 0.37], [x - 0.25, y], [x, y - 0.37], last]
}

const lookupArray = (
  structs: string,
  visFunc: (x: number, y: number, index: number) => any,
) => {
  charPosIterator(structs, (x, y, _, i) => {
    visFunc(x, y, i)
  })
}

export default function visual(room: Room) {
  const vis = room.visual
  const structs = room.memory.structs
  let links = ''
  if (structs) {
    links = structs.charAt(0)
    const spawnPos = structs.charCodeAt(1)
    vis.circle(spawnPos & 63, spawnPos >> 6, spawnStyle)
    const storagePos = structs.charCodeAt(2)
    vis.rect(
      (storagePos & 63) - 0.25,
      (storagePos >> 6) - 0.25,
      0.5,
      0.5,
      storageStyle,
    )
    const termPos = structs.charCodeAt(3)
    vis.rect((termPos & 63) - 0.25, (termPos >> 6) - 0.25, 0.5, 0.5, termStyle)
    const factoryPos = structs.charCodeAt(4)
    vis.rect(
      (factoryPos & 63) - 0.5,
      (factoryPos >> 6) - 0.5,
      1,
      1,
      factoryStyle,
    )

    lookupArray(structs, (x, y, i) =>
      vis.circle(x, y, i < 11 ? towerStyle : extStyle),
    )
    lookupArray(room.memory[RoomMemoryKeys.shields] || '', (x, y, i) =>
      vis.circle(x, y, shieldStyle),
    )
  }

  const roads = room.memory.roads || ''
  lookupArray(roads, (x, y) => vis.circle(x, y, roadStyle))

  links += (room.memory.controllerLink || '') + (room.memory.links || '')
  lookupArray(links, (x, y) => vis.poly(rect45(x, y), linkStyle))

  const internalLabs = room.memory.internalLabs || ''
  lookupArray(internalLabs, (x, y) => vis.circle(x, y, internalLabStyle))

  const externalLabs = room.memory.externalLabs || ''
  lookupArray(externalLabs, (x, y) => vis.circle(x, y, externalLabStyle))
}
