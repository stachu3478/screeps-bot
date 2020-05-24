import { NOTHING_TODO, FAILED, DONE } from '../constants/response'
import { cheapMove } from 'utils/path';

interface RecycleCreep extends Creep {
  memory: RecycleMemory
}

interface RecycleMemory extends CreepMemory { }

export default function recycle(creep: RecycleCreep) {
  const spawn = Game.spawns[Memory.rooms[creep.memory.room].spawnName || '']
  if (!spawn) return NOTHING_TODO
  const result = spawn.recycleCreep(creep)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, spawn)
  else if (result !== 0) return FAILED
  else return DONE
  return NOTHING_TODO
}
