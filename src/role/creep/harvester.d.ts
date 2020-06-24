export default interface Harvester extends Creep {
  memory: HarvesterMemory
}

interface HarvesterMemory extends CreepMemory {
  _arrive?: string
  _harvest?: Id<Source>
  _repair?: Id<Structure>
  _auto_repair?: Id<Structure>
  _repair_cooldown?: number
  _build?: Id<ConstructionSite>
  _dismantle?: Id<Structure>
  _pick_pos?: string
  _noJob?: number
  hauling: 0 | 1
}
