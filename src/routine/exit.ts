import _ from 'lodash'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, DONE, FAILED } from '../constants/response'
import pos from '../planner/pos'

const exits = [
  FIND_EXIT_TOP,
  FIND_EXIT_BOTTOM,
  FIND_EXIT_LEFT,
  FIND_EXIT_RIGHT,
]

export default function exit(creep: Creep) {
  if (creep.fatigue) return NOTHING_DONE

  let target = creep.memory._exit
  if (!target) {
    const randDir = _.random(0, 3)
    const newTarget = creep.pos.findClosestByPath(exits[randDir])
    if (!newTarget) return NOTHING_TODO
    if (creep.room.lookForAt(LOOK_STRUCTURES, newTarget.x, newTarget.y).length) return NOTHING_DONE
    target = creep.memory._exit = String.fromCharCode(pos(newTarget.x, newTarget.y)) + newTarget.roomName
  }

  const targetNumber = target.charCodeAt(0)
  const targetPos = new RoomPosition(targetNumber & 63, targetNumber >> 6, target.slice(1))

  const result = creep.moveTo(targetPos, { reusePath: 100 })
  if (result === 0) return SUCCESS
  else if (result === ERR_NO_PATH) {
    creep.move(creep.pos.getDirectionTo(25, 25))
    delete creep.memory._exit
    return DONE
  }
  return FAILED
}
