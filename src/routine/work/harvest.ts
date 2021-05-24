import move from 'utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'
import profiler from 'screeps-profiler'

export default profiler.registerFN(function harvest(
  creep: Creep,
  index: number,
  room = creep.room,
) {
  const free = creep.store.getFreeCapacity(RESOURCE_ENERGY)
  const target = room.find(FIND_SOURCES)[index]
  if (!target) return NOTHING_TODO
  const targetPos = room.sources.getPosition(index)
  if (creep.pos.range(targetPos)) {
    creep.say('m' + move.cheap(creep, targetPos, false, 0))
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  const remaining = free - creep.corpus.count(WORK) * HARVEST_POWER
  if (result === ERR_TIRED || result === ERR_NOT_ENOUGH_RESOURCES)
    return NOTHING_TODO
  else if (result !== 0) throw new Error('Invalid error code: ' + result)
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
},
'routineHarvest')
