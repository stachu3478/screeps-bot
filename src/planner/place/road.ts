import { SUCCESS, NOTHING_TODO } from '../../constants/response'
import { getXYRoad } from 'utils/selectFromPos';

export default function placeRoad(room: Room, roads: string) {
  const mem = room.memory
  if (mem._roadBuilt && mem._roadBuilt > Game.time) return NOTHING_TODO

  let minDecay = Infinity
  const times = roads.length
  let iteration = room.memory._road_iteration || 0
  for (let i = 0; i < times; i++) {
    const xy = roads.charCodeAt(iteration)
    const x = xy & 63
    const y = xy >> 6
    const road = getXYRoad(room, x, y)
    if (road) {
      minDecay = Math.min(minDecay, ROAD_DECAY_TIME * Math.floor(road.hits / ROAD_DECAY_AMOUNT) + road.ticksToDecay)
    } else if (room.createConstructionSite(x, y, STRUCTURE_ROAD) === 0) {
      minDecay = 0
      room.memory._road_iteration = iteration
      return SUCCESS
    }
    if (++iteration >= times) iteration = 0
  }
  console.log('Road decay ' + room.name + ' ' + minDecay)
  mem._roadBuilt = Game.time + minDecay
  return NOTHING_TODO
}
