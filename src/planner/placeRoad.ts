import plan from './core'
import { SUCCESS, NOTHING_TODO } from '../constants/response'
import { getXYRoad } from 'utils/selectFromPos';

export default function place(room: Room) {
  const mem = room.memory
  if (mem._roadBuilt && mem._roadBuilt > Game.time) return NOTHING_TODO
  if (!mem.roads) plan(room)
  mem.roads = mem.roads || ''

  let minDecay = Infinity
  const times = mem.roads.length
  let iteration = room.memory._road_iteration || 0
  for (let i = 0; i < times; i++) {
    const xy = mem.roads.charCodeAt(iteration)
    const x = xy & 63
    const y = xy >> 6
    const road = getXYRoad(room, x, y)
    if (road) {
      minDecay = Math.min(minDecay, ROAD_DECAY_TIME * Math.floor(road.hits / ROAD_DECAY_AMOUNT) + road.ticksToDecay)
      continue
    }
    if (room.createConstructionSite(x, y, STRUCTURE_ROAD) === 0) {
      room.memory._road_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  console.log('Road decay ' + room.name + ' ' + minDecay)
  mem._roadBuilt = Game.time + minDecay
  return NOTHING_TODO
}
