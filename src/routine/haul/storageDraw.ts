import draw from './draw'

export default function drawStorage(
  creep: Creep,
  resource: ResourceConstant = RESOURCE_ENERGY,
) {
  const motherRoom = creep.motherRoom
  const storage = motherRoom.storage
  const terminal = motherRoom.terminal
  let target: AnyStoreStructure | undefined = storage
  if (
    !storage ||
    (terminal &&
      storage.store[resource] < creep.store.getFreeCapacity() &&
      storage.store[resource] < terminal.store[resource])
  )
    target = terminal
  return draw(creep, target, resource)
}
