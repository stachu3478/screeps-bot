import { Miner } from 'role/creep/miner'

export default function maintainContainer(
  creep: Miner,
  position: RoomPosition,
) {
  const container = position.building(STRUCTURE_CONTAINER)
  if (!container) {
    const site = position
      .lookFor(LOOK_CONSTRUCTION_SITES)
      .find((c) => c.structureType === STRUCTURE_CONTAINER)
    if (site) {
      creep.memory.state = State.BUILD
      return true
    } else if (position.createConstructionSite(STRUCTURE_CONTAINER) === 0) {
      creep.memory.state = State.BUILD
      return true
    }
  } else if (container.hits < container.hitsMax) {
    creep.cache.auto_repair = container.id
    creep.memory.state = State.REPAIR
    return true
  }
  return false
}
