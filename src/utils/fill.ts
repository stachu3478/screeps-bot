type GenericStoreStructure =
  | StructureStorage
  | StructureTerminal
  | StructureFactory

function isFillable(amount: number, structure?: GenericStoreStructure) {
  return structure && structure.store.getFreeCapacity() > amount
}

export function getFillableGenericStruture(room: Room, amount: number = 1) {
  let structure: GenericStoreStructure | undefined = room.terminal
  if (isFillable(amount, structure)) return structure
  structure = room.storage
  if (isFillable(amount, structure)) return structure
  structure = room.factory
  if (isFillable(amount, structure)) return structure
  return undefined
}
