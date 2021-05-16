import PlannerMatrix from './matrix'
import { getMaximumWorkPartsForSource, getWorkSaturation } from './opts'
import range from 'utils/range'

export default function dump(
  room: Room,
  pm: PlannerMatrix,
  sourcePositions: string[],
  farSourceId: number,
  nearSourceId: number,
) {
  // dump data to Memory
  const terrain = room.getTerrain()
  const sources = room.find(FIND_SOURCES)
  const structs: number[][] = []
  const roads: number[] = []
  const links: number[] = []
  const labs: number[] = []
  const farSource = sources[farSourceId] || sources[nearSourceId]
  const { x: sx, y: sy } = farSource ? farSource.pos : { x: 0, y: 0 }
  pm.each((v, xy, x, y) => {
    if (v === -1) {
      structs.push([xy, Math.max(pm.getWeight(x, y), range(sx - x, sy - y))])
    } else if (v === -2) {
      links.push(xy)
    } else if (v === -3) {
      labs.push(xy)
    } else if (v === -4) {
      room.memory.controllerLink = String.fromCharCode(xy)
    } else if (v > 0 && v < 100) {
      roads.push(xy)
    }
  })
  room.memory.structs = structs
    .sort((a, b) => a[1] - b[1])
    .map((n) => String.fromCharCode(n[0]))
    .join('')
  const spawnXY = room.memory.structs.charCodeAt(0)
  const spawnX = spawnXY & 63
  const spawnY = spawnXY >> 6
  room.memory.roads = roads
    .sort(
      (a, b) =>
        range((a & 63) - spawnX, (a >> 6) - spawnY) -
        range((b & 63) - spawnX, (b >> 6) - spawnY),
    )
    .map((n) => String.fromCharCode(n))
    .join('')
  room.memory[RoomMemoryKeys.sourceInfo] = sourcePositions
  room.memory[RoomMemoryKeys.colonySourceIndex] = farSourceId
  room.memory.maxWorkController = Math.ceil(
    getMaximumWorkPartsForSource(
      getWorkSaturation(50, 2 * sourcePositions[nearSourceId].charCodeAt(1)),
    ),
  )
  room.memory.links = links.map((n) => String.fromCharCode(n)).join('')
}
