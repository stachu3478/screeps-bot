import move from '../../utils/path'
import draw from './draw';

interface StorageDrawCreep extends Creep {
  memory: StorageDrawMemory
}

interface StorageDrawMemory extends CreepMemory { }

export default function drawStorage(creep: StorageDrawCreep) {
  const motherRoom = creep.motherRoom
  const storage = motherRoom.storage
  const terminal = motherRoom.terminal
  let target: AnyStoreStructure | undefined = storage
  if (!storage || (terminal && storage.store[RESOURCE_ENERGY] < creep.store.getFreeCapacity() && storage.store[RESOURCE_ENERGY] < terminal.store[RESOURCE_ENERGY])) target = terminal
  return draw(creep, target)
}
