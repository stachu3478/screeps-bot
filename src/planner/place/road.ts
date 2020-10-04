import { SUCCESS, NOTHING_TODO } from '../../constants/response'
import { getXYRoad } from 'utils/selectFromPos'
import charPosIterator from 'utils/charPosIterator'

import _ from 'lodash'

export default function placeRoad(room: Room, roads: string) {
  const cache = room.cache
  if (cache.roadBuilt || 0 > Game.time) return NOTHING_TODO

  let minDecay = Infinity
  const result = charPosIterator(
    roads,
    (x, y, _xy, _, iteration): number | void => {
      const road = getXYRoad(room, x, y)
      if (road) {
        minDecay = Math.min(
          minDecay,
          ROAD_DECAY_TIME * Math.floor(road.hits / ROAD_DECAY_AMOUNT) +
            road.ticksToDecay,
        )
      } else if (room.createConstructionSite(x, y, STRUCTURE_ROAD) === 0) {
        minDecay = 0
        cache.road_iteration = iteration
        return SUCCESS
      }
    },
    cache.road_iteration || 0,
  )
  if (!_.isUndefined(result)) return result
  console.log('Road decay ' + room.name + ' ' + minDecay)
  cache.roadBuilt = Game.time + minDecay
  return NOTHING_TODO
}
