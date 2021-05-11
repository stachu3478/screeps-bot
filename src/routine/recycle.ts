import { NOTHING_TODO, FAILED, DONE, NOTHING_DONE } from '../constants/response'
import move from 'utils/path'

export default function recycle(creep: Creep) {
  const spawn = creep.motherRoom.spawn
  if (!spawn) return NOTHING_TODO
  const result = spawn.recycleCreep(creep)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, spawn)
  else if (result !== 0) return FAILED
  else return DONE
  return NOTHING_DONE
}
