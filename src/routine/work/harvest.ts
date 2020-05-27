import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'
import { roomPos } from 'planner/pos'
import profiler from "screeps-profiler"

interface HarvestCreep extends Creep {
  memory: HarvestMemory
}

interface HarvestMemory extends CreepMemory {
  _harvest?: Id<Source>
  _targetPos?: string
}

export default profiler.registerFN(function harvest(creep: HarvestCreep, sourceId?: Id<Source>) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  const mem = creep.memory
  let target = mem._harvest && Game.getObjectById(mem._harvest)
  if (!target) {
    if (sourceId) target = Game.getObjectById(sourceId)
    if (!target) return NOTHING_TODO
    mem._harvest = target.id
  }
  let targetPos
  if (!creep.room.memory.colonySources) return FAILED
  if (!mem._targetPos) mem._targetPos = creep.room.memory.colonySources[target.id][0]
  const targetPosCode = mem._targetPos.charCodeAt(0)
  if (creep.pos.x !== (targetPosCode & 63) || creep.pos.y !== (targetPosCode >> 6) || creep.room.name !== creep.memory.room) {
    targetPos = roomPos(mem._targetPos, Game.rooms[creep.memory.room].name)
    cheapMove(creep, targetPos)
    return NOTHING_DONE
  }
  const result = creep.harvest(target)
  const remaining = creep.store.getFreeCapacity(RESOURCE_ENERGY) - creep.getActiveBodyparts(WORK) * HARVEST_POWER
  if (result === ERR_TIRED) return NOTHING_TODO
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return DONE
    return SUCCESS
  }
}, 'routineHarvest')
