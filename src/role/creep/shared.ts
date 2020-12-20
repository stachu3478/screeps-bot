export function ensureEmpty(creep: Creep) {
  // still needs that
  RESOURCES_ALL.find((resource) => {
    return creep.store[resource] > 0 && creep.drop(resource) === 0
  })
}
