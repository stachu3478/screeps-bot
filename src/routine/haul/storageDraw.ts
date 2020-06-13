import move from '../../utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, DONE } from 'constants/response'

interface StorageDrawCreep extends Creep {
  memory: StorageDrawMemory
}

interface StorageDrawMemory extends CreepMemory { }

export default function drawStorage(creep: StorageDrawCreep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return DONE
  const motherRoom = Game.rooms[creep.memory.room]
  const storage = motherRoom.storage
  const terminal = motherRoom.terminal
  let target: AnyStoreStructure | undefined = storage
  if (!storage || (terminal && storage.store[RESOURCE_ENERGY] < creep.store.getFreeCapacity() && storage.store[RESOURCE_ENERGY] < terminal.store[RESOURCE_ENERGY])) target = terminal
  if (!target || target.store[RESOURCE_ENERGY] === 0) return NOTHING_TODO
  const result = creep.withdraw(target, RESOURCE_ENERGY)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target)
  else if (result !== 0) return FAILED
  else return SUCCESS
  return NOTHING_DONE
}
