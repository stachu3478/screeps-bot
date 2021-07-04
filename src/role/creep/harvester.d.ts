export default interface Harvester extends Creep {
  memory: HarvesterMemory
  cache: HarvesterCache
}

interface HarvesterMemory extends CreepMemory {
  _arrive?: string
}

interface HarvesterCache extends CreepCache {
  dismantle?: Id<Structure>
  repair?: Id<Structure>
  auto_repair?: Id<Structure>
  repair_cooldown?: number
  build?: Id<ConstructionSite>
}
