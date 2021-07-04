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
export const ALL_EXIT_CONSTANTS: FindExitConstant[] = [
  FIND_EXIT_TOP,
  FIND_EXIT_RIGHT,
  FIND_EXIT_LEFT,
  FIND_EXIT_BOTTOM,
]
export const SOURCE_KEEPER_USERNAME = 'Source Keeper'
export const INVADER_USERNAME = 'Invader'
