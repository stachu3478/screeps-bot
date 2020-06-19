import { SUCCESS, NOTHING_TODO, FAILED, NO_RESOURCE } from '../../constants/response'

interface AutiBuildCreep extends Creep {
  memory: AutiBuildMemory
}

interface AutiBuildMemory extends CreepMemory {
  _build?: Id<ConstructionSite>
}

export default function autoBuild(creep: AutiBuildCreep) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  let target = creep.memory._build && Game.getObjectById(creep.memory._build)
  if (!target) {
    target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0]
    if (!target) return NOTHING_TODO
    creep.memory._build = target.id
  }
  const result = creep.build(target)
  if (result !== 0) return FAILED
  else {
    const remaining = storedEnergy - creep.getActiveBodyparts(WORK) * BUILD_POWER
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
}
