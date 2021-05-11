import move from 'utils/path'
import {
  SUCCESS,
  NOTHING_TODO,
  NOTHING_DONE,
  FAILED,
  DONE,
} from 'constants/response'
import profiler from 'screeps-profiler'

interface HarvestCreep extends Creep {
  memory: HarvestMemory
}

interface HarvestMemory extends CreepMemory {
  _harvest?: Id<Source>
}

export default profiler.registerFN(function harvest(creep: HarvestCreep) {
  const energyStored = creep.store.getFreeCapacity(RESOURCE_ENERGY)
  if (energyStored === 0) return DONE
  const mem = creep.memory
  const target = mem._harvest && Game.getObjectById(mem._harvest)
  if (!target) return NOTHING_TODO
  const targetPos = creep.room.sources.getPosition(target.id)
  if (creep.pos.range(targetPos)) {
    move.cheap(creep, targetPos, false, 0)
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  const remaining = energyStored - creep.corpus.count(WORK) * HARVEST_POWER
  if (result === ERR_TIRED) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'routineHarvest')
