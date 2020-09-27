import draw from './draw'

export default function drawStorage(creep: Creep) {
  const motherRoom = creep.motherRoom
  const storage = motherRoom.storage
  const terminal = motherRoom.terminal
  let target: AnyStoreStructure | undefined = storage
  if (
    !storage ||
    (terminal &&
      storage.store[RESOURCE_ENERGY] < creep.store.getFreeCapacity() &&
      storage.store[RESOURCE_ENERGY] < terminal.store[RESOURCE_ENERGY])
  )
    target = terminal
  return draw(creep, target)
}
