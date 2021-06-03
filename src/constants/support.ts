import _ from 'lodash'

const getBodyPartHits = () => {
  let hits: number = 100
  _.some(Game.rooms, (room) =>
    room.find(FIND_CREEPS).some((creep) => {
      hits = creep.hitsMax / creep.body.length
    }),
  )
  return hits
}

export const ALL_DIRECTIONS: DirectionConstant[] = [
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
]
export const BODYPART_HITS = getBodyPartHits()
export const RANGED_MASS_ATTACK_POWER = [10, 10, 4, 1]
export const CREEP_RANGE = 3
