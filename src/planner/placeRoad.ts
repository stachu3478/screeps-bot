import plan from './core'
import { SUCCESS, NOTHING_TODO } from '../constants/response'

export default function place(room: Room) {
  const mem = room.memory
  if (mem._roadBuilt) return NOTHING_TODO
  if (!mem.roads) plan(room)
  mem.roads = mem.roads || ''
  const times = mem.roads.length
  let iteration = room.memory._road_iteration || 0
  for (let i = 0; i < times; i++) {
    const xy = mem.roads.charCodeAt(iteration)
    const x = xy & 63
    const y = xy >> 6
    if (room.createConstructionSite(x, y, STRUCTURE_ROAD) === 0) {
      room.memory._road_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  mem._roadBuilt = true
  return NOTHING_TODO
}
