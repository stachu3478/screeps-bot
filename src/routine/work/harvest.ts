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
) {
  const free = creep.store.getFreeCapacity(RESOURCE_ENERGY)
  if (free === 0) return DONE
  const target = creep.room.find(FIND_SOURCES)[index]
  if (!target) return NOTHING_TODO
  const targetPos = creep.room.sources.getPosition(index)
  if (creep.pos.range(targetPos)) {
    creep.say('m' + move.cheap(creep, targetPos, false, 0))
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  const remaining = free - creep.corpus.count(WORK) * HARVEST_POWER
  if (result === ERR_TIRED) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
},
'routineHarvest')
