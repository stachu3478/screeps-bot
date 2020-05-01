import PlannerMatrix from "./matrix";
import { getMaximumWorkPartsForSource, getWorkSaturation } from "./opts"

interface SourceMap {
  [id: string]: string[]
}
const d = (x: number, y: number): number => Math.max(Math.abs(x), Math.abs(y))
export default function dump(room: Room, pm: PlannerMatrix, pathLength: number[], sourcePositions: SourceMap, farSourceId: Id<Source>, nearSourceId: Id<Source>) {
  // dump data to Memory
  const terrain = room.getTerrain()
  const structs: number[][] = []
  const roads: number[] = []
  let totalRoadCost = 0
  pm.each((v, xy, x, y) => {
    if (v === -1) {
      structs.push([
        xy,
        pm.getWeight(x, y)
      ])
    } else if (v > 0) {
      roads.push(xy)
      if (terrain.get(x, y) === 0) totalRoadCost++
      else totalRoadCost += 5
    }
  })
  room.memory.structs = structs.sort((a, b) => a[1] - b[1]).map(n => String.fromCharCode(n[0])).join('')
  const spawnXY = room.memory.structs.charCodeAt(0)
  const spawnX = spawnXY & 63
  const spawnY = spawnXY >> 6
  room.memory.totalRoadCost = totalRoadCost
  room.memory.roads = roads.sort((a, b) => d((a & 63) - spawnX, (a >> 6) - spawnY) - d((b & 63) - spawnX, (b >> 6) - spawnY)).map(n => String.fromCharCode(n)).join('')
  room.memory.sourceToControllerPathLength = pathLength.sort((a, b) => b - a)
  room.memory.colonySources = sourcePositions
  room.memory.colonySourceId = farSourceId
  room.memory.controllerSourceId = nearSourceId
  room.memory.maxWorkController = getMaximumWorkPartsForSource(getWorkSaturation(25, 50 + pathLength[0]))
  room.memory.maxWorkSpawn = getMaximumWorkPartsForSource(getWorkSaturation(25, 25)) // try to maintain
}
