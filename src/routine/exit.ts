import _ from 'lodash'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  DONE,
  FAILED,
} from '../constants/response'
import pos from '../planner/pos'
import move, { isWalkable } from 'utils/path'

const exits = [FIND_EXIT_TOP, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT, FIND_EXIT_RIGHT]

interface ExitCreep extends Creep {
  cache: ExitCache
}

interface ExitCache extends CreepCache {
  exit: string
}

export default function exit(creep: ExitCreep) {
  if (creep.fatigue) return NOTHING_DONE

  const cache = creep.cache
  let target = cache.exit
  if (!target) {
    const randDir = _.random(0, 3)
    const newTarget = creep.pos.findClosestByPath(exits[randDir])
    if (!newTarget) return NOTHING_TODO
    if (!isWalkable(Game.rooms[newTarget.roomName], newTarget.x, newTarget.y))
      return NOTHING_DONE
    target = cache.exit =
      String.fromCharCode(pos(newTarget.x, newTarget.y)) + newTarget.roomName
  }

  const targetNumber = target.charCodeAt(0)
  const targetPos = new RoomPosition(
    targetNumber & 63,
    targetNumber >> 6,
    target.slice(1),
  )

  const result = move.cheap(creep, targetPos, true)
  if (result === 0) return SUCCESS
  else if (result === ERR_NO_PATH) {
    move.anywhere(creep, creep.pos.getDirectionTo(targetPos))
    delete cache.exit
    return DONE
  }
  return FAILED
}
