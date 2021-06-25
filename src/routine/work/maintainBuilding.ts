import { Miner } from 'role/creep/miner'

function findOrCreateBuildingOrSite(
  position: RoomPosition,
  type: BuildableStructureConstant,
) {
  return (
    position.building(type) ||
    position
      .lookFor(LOOK_CONSTRUCTION_SITES)
      .find((c) => c.structureType === type) ||
    position.createConstructionSite(type) === 0
  )
}

export default function maintainBuilding(
  creep: Miner,
  position: RoomPosition,
  type: BuildableStructureConstant,
) {
  const buildingOrSite = findOrCreateBuildingOrSite(position, type)
  if (!(buildingOrSite instanceof Structure)) {
    creep.memory.state = State.BUILD
    return true
  } else if (buildingOrSite.hits < buildingOrSite.hitsMax) {
    creep.cache.auto_repair = buildingOrSite.id
    creep.memory.state = State.REPAIR
    return true
  }
  return false
}

export function maintainBuildingActively(
  creep: Miner,
  position: RoomPosition,
  type: BuildableStructureConstant,
) {
  const buildingOrSite = findOrCreateBuildingOrSite(position, type)
  if (buildingOrSite instanceof ConstructionSite) {
    creep.build(buildingOrSite)
  } else if (
    buildingOrSite instanceof Structure &&
    buildingOrSite.hits < buildingOrSite.hitsMax
  ) {
    creep.repair(buildingOrSite)
  }
}
